import { useEffect, useState } from "react";

export type Score = 0 | 0.5 | 1;

export type SessionAnswer = {
  questionId: string;
  questionText: string;
  modelAnswer: string;
  userAnswer: string;
  score: Score;
  caseTitle?: string;
};

export type SessionRecord = {
  id: string;
  date: number;
  mode: "theme" | "simulator";
  label: string;
  answers: SessionAnswer[];
  totalPoints: number;
  maxPoints: number;
  percent: number;
  grade: string;
  gradeLabel: string;
};

function fromRow(row: Record<string, unknown>): SessionRecord {
  return {
    id: row.id as string,
    date: Number(row.date),
    mode: row.mode as "theme" | "simulator",
    label: row.label as string,
    answers: row.answers as SessionAnswer[],
    totalPoints: Number(row.total_points),
    maxPoints: Number(row.max_points),
    percent: Number(row.percent),
    grade: row.grade as string,
    gradeLabel: row.grade_label as string,
  };
}

export async function saveSession(rec: SessionRecord) {
  await fetch("/api/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(rec),
  });
}

export async function deleteSession(id: string) {
  await fetch("/api/sessions", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export async function clearHistory() {
  await fetch("/api/sessions/clear", { method: "POST" });
}

export function useHistory() {
  const [list, setList] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    return fetch("/api/sessions")
      .then((r) => r.json())
      .then((rows: Record<string, unknown>[]) => setList(rows.map(fromRow)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  return { list, loading, reload };
}
