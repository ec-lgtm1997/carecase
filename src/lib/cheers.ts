export const CORRECT_CHEERS = [
  "Askimmm du bist eine Löwin ✨",
  "Pflegerimm Streberimmm",
  "Eeehhh kimin sevgilisiii ❤️",
  "Baammm das saß perfekt",
  "Gehirn wie ein Lehrbuch ama Herz wie Sonne",
  "Gilette Klinge bist du",
];

export const ENCOURAGE = [
  "Nächste Frage wird wieder und vergiss ned genug trinkennnn",
  "Fehler sind nur Helfer beim Lernennnn",
  "Wird schon",
];

export const FINISH_GREAT = [
  "Löwin",
  "Wenn ich Hände hätte, würde ich klatschen.",
  "Du bist bereit. Punkt. Ende der Diskussion.",
];

export const FINISH_OK = [
];

export function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
