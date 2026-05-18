import raw from "@/data/exam_mit_schluesselbegriffen.json";

export type Schluessel = {
  begriffe: string[];
  stichpunkte: string[];
};

export type Question = {
  id: string;
  q: string;
  a: string;
  theme: string;
  schluessel?: Schluessel;
  caseTitle?: string;
  caseVignette?: string;
};

type RawQuestion = { q: string; a: string; schluessel?: Schluessel };
type Raw = {
  themes: { name: string; questions: RawQuestion[] }[];
  cases: { title: string; vignette: string; questions: RawQuestion[] }[];
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
    schluessel: q.schluessel,
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
    schluessel: q.schluessel,
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
