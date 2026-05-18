import raw from "@/data/exam.json";

export type Question = {
  id: string;
  q: string;
  a: string;
  theme: string;
  caseTitle?: string;
  caseVignette?: string;
};

type Raw = {
  themes: { name: string; questions: { q: string; a: string }[] }[];
  cases: { title: string; vignette: string; questions: { q: string; a: string }[] }[];
};

const data = raw as Raw;

export const themes = data.themes.map((t, ti) => ({
  id: `t${ti}`,
  name: t.name,
  questions: t.questions.map((q, qi): Question => ({
    id: `t${ti}-q${qi}`,
    q: q.q,
    a: q.a,
    theme: t.name,
  })),
}));

export const cases = data.cases.map((c, ci) => ({
  id: `c${ci}`,
  title: c.title,
  vignette: c.vignette,
  questions: c.questions.map((q, qi): Question => ({
    id: `c${ci}-q${qi}`,
    q: q.q,
    a: q.a,
    theme: c.title,
    caseTitle: c.title,
    caseVignette: c.vignette,
  })),
}));

export const allQuestions: Question[] = [
  ...themes.flatMap(t => t.questions),
  ...cases.flatMap(c => c.questions),
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}
