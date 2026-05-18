import { useEffect } from "react";
import { SessionRecord } from "@/lib/history";

export function ResultScreen({
  record,
  message,
  onExit,
}: {
  record: SessionRecord;
  message: string;
  onExit: () => void;
}) {
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 animate-fade-up">
      <div className="rounded-3xl bg-card border border-border shadow-lg p-7 sm:p-10 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {record.label}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl text-primary mt-3 mb-1">
          {record.grade}
        </h1>
        <p className="text-muted-foreground mb-6">{record.gradeLabel}</p>

        <div className="grid grid-cols-2 gap-3 my-7">
          <Stat label="Punkte" value={`${record.totalPoints} / ${record.maxPoints}`} />
          <Stat label="Prozent" value={`${record.percent}%`} />
        </div>

        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-7">
          <div
            className="h-full bg-gradient-to-r from-primary via-success to-warm transition-all duration-1000"
            style={{ width: `${record.percent}%` }}
          />
        </div>

        <p className="font-display text-lg text-foreground leading-snug px-2">
          {message}
        </p>

        <button
          onClick={onExit}
          className="mt-8 w-full rounded-full bg-primary text-primary-foreground font-medium py-4 shadow-md hover:shadow-lg active:scale-[0.98] transition"
        >
          Zurück zum Start
        </button>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg text-foreground mb-3 px-1">Dein Durchgang im Detail</h3>
        <div className="space-y-3">
          {record.answers.map((a, i) => (
            <div key={a.questionId} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <span className="text-xs text-muted-foreground">Frage {i + 1}</span>
                <ScorePill score={a.score} />
              </div>
              <p className="text-sm font-medium text-foreground">{a.questionText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  const cls =
    score === 1
      ? "bg-success text-success-foreground"
      : score === 0.5
      ? "bg-warning text-warning-foreground"
      : "bg-warm text-warm-foreground";
  const label = score === 1 ? "1,0" : score === 0.5 ? "0,5" : "0";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
