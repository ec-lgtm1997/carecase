export const CORRECT_CHEERS = [
  "Askimmm du bist eine Löwin ✨",
  "Pflegerimm Streberimmm",
  "Eeehhh kimin sevgilisiii ❤️",
  "Canim, das saß perfekt",
  "Prüfung? Pff. Du isst die zum Frühstück",
  "Brain wie ein Lehrbuch, Herz wie Sonne",
  "Notenkönigin im Anmarsch",
];

export const ENCOURAGE = [
  "Nächste Frage wird wieder — und vergiss ned genug trinken",
  "Fehler sind nur Helfer beim Lernennnn",
  "Atmen, lächeln, weiter — du schaffst das eh",
  "Du baust gerade dein Wissen Stein für Stein",
];

export const FINISH_GREAT = [
  "Das war richtig stark. Ich bin so stolz auf dich.",
  "Wenn ich Hände hätte, würde ich klatschen — riesig.",
  "Du bist bereit. Punkt. Ende der Diskussion.",
];

export const FINISH_OK = [
  "Solide Runde. Beim nächsten Mal noch ein Stück besser.",
  "Du bist auf dem Weg — bleib dran, das wird.",
];

export function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
