import { useEffect, useState } from "react";
import { getSyncCode } from "./sync-id";
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

const LOCAL_KEY = "ccm.history.v1";

function readLocal(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

function writeLocal(list: SessionRecord[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("ccm-history-changed"));
}

export function saveSession(rec: SessionRecord) {
  const list = readLocal();
  list.unshift(rec);
  writeLocal(list.slice(0, 200));

  const syncCode = getSyncCode();
  if (syncCode) {
    saveSessionFn({ data: { syncCode, record: rec } }).catch(console.error);
  }
}

export function deleteSession(id: string) {
  writeLocal(readLocal().filter((r) => r.id !== id));

  const syncCode = getSyncCode();
  if (syncCode) {
    deleteSessionFn({ data: { syncCode, sessionId: id } }).catch(console.error);
  }
}

export function clearHistory() {
  writeLocal([]);

  const syncCode = getSyncCode();
  if (syncCode) {
    clearSessionsFn({ data: syncCode }).catch(console.error);
  }
}

export async function syncFromCloud(syncCode: string): Promise<SessionRecord[]> {
  const records = await fetchSessions({ data: syncCode });
  writeLocal(records);
  return records;
}

export function useHistory() {
  const [list, setList] = useState<SessionRecord[]>([]);
  useEffect(() => {
    setList(readLocal());
    const h = () => setList(readLocal());
    window.addEventListener("ccm-history-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ccm-history-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}
