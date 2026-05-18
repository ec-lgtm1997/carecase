import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { themes, cases, allQuestions, pickRandom, Question } from "@/lib/exam-data";
import { ExamSession } from "@/components/ExamSession";
import { History } from "@/components/History";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Care & Case Management — Prüfungsvorbereitung" },
      {
        name: "description",
        content:
          "Lern-App für die Prüfung in Care und Case Management  mit Fragen, Musterlösungen, Fall­vignetten und Lern-Historie.",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: Home,
});

type Tab = "learn" | "exam" | "history";
type Session = { questions: Question[]; mode: "theme" | "simulator"; label: string } | null;

function Home() {
  const [tab, setTab] = useState<Tab>("learn");
  const [session, setSession] = useState<Session>(null);
  const [simCount, setSimCount] = useState(5);

  if (session) {
    return (
      <main className="min-h-screen safe-top">
        <ExamSession
          questions={session.questions}
          mode={session.mode}
          label={session.label}
          onExit={() => setSession(null)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen safe-top">
      <header className="mx-auto max-w-2xl px-4 pt-6 pb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          Prüfungsvorbereitung
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-foreground leading-tight mt-1">
          Care & Case Management
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Alsooo Askim nutz die Webseite und mach deine Klinge scharf damit du rasierstt!!
        </p>
      </header>

      <nav className="sticky top-0 z-30 glass border-b border-border mt-4">
        <div className="mx-auto max-w-2xl px-2 flex gap-1 overflow-x-auto">
          <TabBtn active={tab === "learn"} onClick={() => setTab("learn")}>Lernen</TabBtn>
          <TabBtn active={tab === "exam"} onClick={() => setTab("exam")}>Prüfung simulieren</TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")}>Lern-Historie</TabBtn>
        </div>
      </nav>

      {tab === "learn" && (
        <section className="mx-auto max-w-2xl px-4 py-5 space-y-3">
          <h2 className="font-display text-xl text-foreground px-1">Themenbereiche</h2>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setSession({ questions: t.questions, mode: "theme", label: t.name })
              }
              className="w-full text-left rounded-2xl bg-card border border-border p-5 hover:shadow-md hover:border-primary/30 transition active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg text-foreground leading-snug">{t.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.questions.length} {t.questions.length === 1 ? "Frage" : "Fragen"}
                  </p>
                </div>
                <span className="text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                  →
                </span>
              </div>
            </button>
          ))}

          <h2 className="font-display text-xl text-foreground px-1 pt-6">Fallbeispiele</h2>
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                setSession({ questions: c.questions, mode: "theme", label: c.title })
              }
              className="w-full text-left rounded-2xl bg-card border border-border p-5 hover:shadow-md hover:border-primary/30 transition active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-foreground leading-snug">{c.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {c.vignette.split("\n")[0]}
                  </p>
                </div>
                <span className="text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0">
                  →
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      {tab === "exam" && (
        <section className="mx-auto max-w-2xl px-4 py-5">
          <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-accent/40 to-warm/15 border border-primary/20 p-6 sm:p-8">
            <h2 className="font-display text-2xl text-foreground">Prüfungs-Simulator</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Ein zufälliger Mix aus allen Themen und Fallbeispielen.
            </p>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Anzahl Fragen
              </p>
              <div className="flex gap-2 flex-wrap">
                {[3, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSimCount(n)}
                    className={`rounded-full px-5 py-2 text-sm font-medium border transition ${
                      simCount === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setSession({
                  questions: pickRandom(allQuestions, simCount),
                  mode: "simulator",
                  label: `Prüfungs-Simulator · ${simCount} Fragen`,
                })
              }
              className="mt-7 w-full rounded-full bg-primary text-primary-foreground font-medium py-4 shadow-md hover:shadow-lg active:scale-[0.98] transition"
            >
              Simulation starten
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-card border border-border p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Tipp:</span> Schreib deine Antworten
              wirklich aus, weil das aktive Formulieren ist beim Lernen
              fast wichtiger als das Lesen.
            </p>
          </div>
        </section>
      )}

      {tab === "history" && <History />}

      <footer className="mx-auto max-w-2xl px-4 py-8 text-center text-xs text-muted-foreground safe-bottom">
        Mit Liebe gebaut. Für dich.
      </footer>
    </main>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}
