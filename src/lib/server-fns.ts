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
  .handler(async () => {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT * FROM sessions ORDER BY date DESC LIMIT 200"
    );
    return rows.map(toRecord);
  });

export const saveSessionFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: SessionRecord }) => {
    const r = data;
    const pool = getPool();
    await pool.query(
      `INSERT INTO sessions (id, date, mode, label, answers, total_points, max_points, percent, grade, grade_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.date, r.mode, r.label, JSON.stringify(r.answers),
       r.totalPoints, r.maxPoints, r.percent, r.grade, r.gradeLabel]
    );
    return { ok: true };
  });

export const deleteSessionFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: string }) => {
    const pool = getPool();
    await pool.query("DELETE FROM sessions WHERE id = $1", [data]);
    return { ok: true };
  });

export const clearSessionsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const pool = getPool();
    await pool.query("DELETE FROM sessions");
    return { ok: true };
  });
