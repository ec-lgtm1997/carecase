import "./lib/error-capture";

import { Pool } from "pg";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith("/api/sessions")) return null;

  const db = getPool();

  try {
    if (request.method === "GET" && path === "/api/sessions") {
      const { rows } = await db.query(
        "SELECT * FROM sessions ORDER BY date DESC LIMIT 200"
      );
      return json(rows);
    }

    if (request.method === "POST" && path === "/api/sessions") {
      const r = await request.json() as Record<string, unknown>;
      await db.query(
        `INSERT INTO sessions (id, date, mode, label, answers, total_points, max_points, percent, grade, grade_label)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.date, r.mode, r.label, JSON.stringify(r.answers),
         r.totalPoints, r.maxPoints, r.percent, r.grade, r.gradeLabel]
      );
      return json({ ok: true });
    }

    if (request.method === "DELETE" && path === "/api/sessions") {
      const { id } = await request.json() as { id: string };
      await db.query("DELETE FROM sessions WHERE id = $1", [id]);
      return json({ ok: true });
    }

    if (request.method === "POST" && path === "/api/sessions/clear") {
      await db.query("DELETE FROM sessions");
      return json({ ok: true });
    }
  } catch (err) {
    console.error("[API] sessions error:", err);
    return json({ error: String(err) }, 500);
  }

  return null;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return false; }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return false;
  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) return false;
  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) return response;
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const apiResponse = await handleApi(request);
    if (apiResponse) return apiResponse;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
