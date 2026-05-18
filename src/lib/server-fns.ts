import { createServerFn } from "@tanstack/react-start";
import { getPool } from "./db";
import type { SessionRecord } from "./history";

function toRecord(row: Record<string, unknown>): SessionRecord {
  return {
    id: row.id as string,
    date: row.date as number,
    mode: row.mode as "theme" | "simulator",
    label: row.label as string,
    answers: row.answers as SessionRecord["answers"],
    totalPoints: row.total_points as number,
    maxPoints: row.max_points as number,
    percent: row.percent as number,
    grade: row.grade as string,
    gradeLabel: row.grade_label as string,
  };
}

export const fetchSessions = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: string }) => {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT * FROM sessions WHERE sync_code = $1 ORDER BY date DESC LIMIT 200",
      [data]
    );
    return rows.map(toRecord);
  });

export const saveSessionFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { syncCode: string; record: SessionRecord } }) => {
    const { syncCode, record: r } = data;
    const pool = getPool();
    await pool.query(
      `INSERT INTO sessions (id, sync_code, date, mode, label, answers, total_points, max_points, percent, grade, grade_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, syncCode, r.date, r.mode, r.label, JSON.stringify(r.answers),
       r.totalPoints, r.maxPoints, r.percent, r.grade, r.gradeLabel]
    );
    return { ok: true };
  });

export const deleteSessionFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { syncCode: string; sessionId: string } }) => {
    const { syncCode, sessionId } = data;
    const pool = getPool();
    await pool.query(
      "DELETE FROM sessions WHERE id = $1 AND sync_code = $2",
      [sessionId, syncCode]
    );
    return { ok: true };
  });

export const clearSessionsFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: string }) => {
    const pool = getPool();
    await pool.query("DELETE FROM sessions WHERE sync_code = $1", [data]);
    return { ok: true };
  });
