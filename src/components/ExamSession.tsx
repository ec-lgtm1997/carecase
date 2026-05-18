import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Question } from "@/lib/exam-data";
import { ChevronDown } from "lucide-react";
import { Score, SessionAnswer, SessionRecord, saveSession } from "@/lib/history";
import { gradeFromPercent } from "@/lib/grade";
import { CORRECT_CHEERS, ENCOURAGE, FINISH_GREAT, FINISH_OK, pickOne } from "@/lib/cheers";
import { useFeedbackToaster } from "./Toast";
import { ResultScreen } from "./ResultScreen";

type Props = {
  questions: Question[];
  mode: "theme" | "simulator";
  label: string;
  onExit: () => void;
};

export function ExamSession({ questions, mode, label, onExit }: Props) {
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [done, setDone] = useState<SessionRecord | null>(null);
  const { node: toastNode, onCorrect, onWrong } = useFeedbackToaster();

  const q = questions[idx];
  const progress = useMemo(() => ((idx) / questions.length) * 100, [idx, questions.length]);

  function score(s: Score) {
    const entry: SessionAnswer = {
      questionId: q.id,
      questionText: q.q,
      modelAnswer: q.a,
      userAnswer,
      score: s,
      caseTitle: q.caseTitle,
    };
    const next = [...answers, entry];
    setAnswers(next);

    if (s === 1) onCorrect(CORRECT_CHEERS);
    else if (s === 0) onWrong(ENCOURAGE);

    if (idx + 1 >= questions.length) {
      const totalPoints = next.reduce((sum, a) => sum + a.score, 0);
      const maxPoints = next.length;
      const percent = Math.round((totalPoints / maxPoints) * 100);
      const g = gradeFromPercent(percent);
      const rec: SessionRecord = {
        id: crypto.randomUUID(),
        date: Date.now(),
        mode,
        label,
        answers: next,
        totalPoints,
        maxPoints,
        percent,
        grade: g.grade,
        gradeLabel: g.label,
      };
      saveSession(rec);
      if (parseFloat(g.grade.replace(",", ".")) <= 2.0) {
        setTimeout(() => fireConfetti(), 200);
      }
      setDone(rec);
    } else {
      setIdx(idx + 1);
      setUserAnswer("");
      setRevealed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (done) {
    const grade = parseFloat(done.grade.replace(",", "."));
    const message = grade <= 2.0 ? pickOne(FINISH_GREAT) : pickOne(FINISH_OK);
    return <ResultScreen record={done} message={message} onExit={onExit} />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12">
      {toastNode}
      <div className="flex items-center justify-between mb-4 pt-2">
        <button
          onClick={onExit}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Abbrechen
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          Frage {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-6">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-5 animate-fade-up" key={q.id}>
        {q.caseVignette && (
          <div className="rounded-2xl bg-accent/40 border border-accent p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Fallbeispiel · {q.caseTitle}
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {q.caseVignette}
            </p>
          </div>
        )}

        <div className="rounded-3xl bg-card border border-border shadow-sm p-6">
          <h2 className="font-display text-2xl text-foreground leading-tight">
            {q.q}
          </h2>
        </div>

        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Formuliere hier deine Antwort in eigenen Worten…"
          rows={7}
          className="w-full rounded-2xl bg-card border border-border p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition"
        />

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={userAnswer.trim().length === 0}
            className="w-full rounded-full bg-primary text-primary-foreground font-medium py-4 shadow-md hover:shadow-lg active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Antwort prüfen
          </button>
        ) : (
          <div className="space-y-5 animate-slide-up">
            <RevealedAnswer question={q} />

            <div>
              <p className="text-center text-sm text-muted-foreground mb-3">
                Wie bewertest du deine Antwort?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => score(1)}
                  className="rounded-2xl bg-success text-success-foreground font-medium py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition"
                >
                  Ganz richtig
                  <span className="block text-xs opacity-80 font-normal mt-0.5">1,0 Punkt</span>
                </button>
                <button
                  onClick={() => score(0.5)}
                  className="rounded-2xl bg-warning text-warning-foreground font-medium py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition"
                >
                  Halb richtig
                  <span className="block text-xs opacity-80 font-normal mt-0.5">0,5 Punkte</span>
                </button>
                <button
                  onClick={() => score(0)}
                  className="rounded-2xl bg-warm text-warm-foreground font-medium py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition"
                >
                  Nicht richtig
                  <span className="block text-xs opacity-80 font-normal mt-0.5">0 Punkte</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RevealedAnswer({ question }: { question: Question }) {
  const [expanded, setExpanded] = useState(false);
  const hasStichwort = question.schluessel && question.schluessel.stichpunkte.length > 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/30 to-warm/10 border border-primary/20 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            ✓
          </span>
          <h3 className="font-display text-lg text-foreground">Musterlösung</h3>
        </div>

        {hasStichwort && (
          <div className="space-y-2 mb-4">
            {question.schluessel!.stichpunkte.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl bg-card/70 border border-border px-3.5 py-2.5"
              >
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-snug">{s}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Volltext ausblenden" : "Vollständige Musterlösung anzeigen"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-primary/15 px-6 pb-6 pt-4">
          <div className="prose-sm text-foreground whitespace-pre-line leading-relaxed">
            {question.a}
          </div>
        </div>
      )}
    </div>
  );
}

function fireConfetti() {
  const end = Date.now() + 1200;
  const colors = ["#2dd4a8", "#fbbf24", "#fb923c", "#34d399"];
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 0.9,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 0.9,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
