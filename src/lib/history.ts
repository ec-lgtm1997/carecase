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
  label: string; // theme name or "Prüfungs-Simulator"
  answers: SessionAnswer[];
  totalPoints: number;
  maxPoints: number;
  percent: number;
  grade: string;
  gradeLabel: string;
};

const KEY = "ccm.history.v1";

function read(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

function write(list: SessionRecord[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("ccm-history-changed"));
}

export function saveSession(rec: SessionRecord) {
  const list = read();
  list.unshift(rec);
  write(list.slice(0, 200));
}

export function deleteSession(id: string) {
  write(read().filter(r => r.id !== id));
}

export function clearHistory() {
  write([]);
}

export function useHistory() {
  const [list, setList] = useState<SessionRecord[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("ccm-history-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ccm-history-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}
