import { useEffect, useState } from "react";
import { saveSessionFn, deleteSessionFn, clearSessionsFn, fetchSessions } from "./server-fns";

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

export function saveSession(rec: SessionRecord) {
  saveSessionFn({ data: rec }).catch(console.error);
}

export function deleteSession(id: string) {
  deleteSessionFn({ data: id }).catch(console.error);
}

export function clearHistory() {
  clearSessionsFn({ data: undefined }).catch(console.error);
}

export function useHistory() {
  const [list, setList] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions({ data: undefined })
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));

    const refresh = () => {
      fetchSessions({ data: undefined }).then(setList).catch(console.error);
    };
    window.addEventListener("ccm-history-changed", refresh);
    return () => window.removeEventListener("ccm-history-changed", refresh);
  }, []);

  return { list, loading };
}

export function notifyHistoryChanged() {
  window.dispatchEvent(new Event("ccm-history-changed"));
}
