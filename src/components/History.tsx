import { useState } from "react";
import { SessionRecord, deleteSession, useHistory } from "@/lib/history";
import { ScorePill } from "./ResultScreen";

export function History() {
  const list = useHistory();
  const [open, setOpen] = useState<SessionRecord | null>(null);

  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-3xl bg-card border border-border p-10">
          <p className="font-display text-xl text-foreground mb-2">Noch keine Durchgänge</p>
          <p className="text-sm text-muted-foreground">
            Sobald du ein Set abgeschlossen hast, erscheint es hier — mit Datum, Note und allen
            Fragen im Detail.
          </p>
        </div>
      </div>
    );
  }

  if (open) {
    return <DetailView record={open} onBack={() => setOpen(null)} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-12 space-y-3">
      {list.map((r) => (
        <button
          key={r.id}
          onClick={() => setOpen(r)}
          className="w-full text-left rounded-2xl bg-card border border-border p-5 hover:shadow-md hover:border-primary/30 transition active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {r.mode === "simulator" ? "Prüfungs-Simulator" : "Themen-Modus"}
              </p>
              <p className="font-display text-lg text-foreground truncate mt-0.5">{r.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(r.date)}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-2xl text-primary leading-none">{r.grade}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {r.totalPoints}/{r.maxPoints} · {r.percent}%
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function DetailView({ record, onBack }: { record: SessionRecord; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-12">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        ← Zurück zur Historie
      </button>

      <div className="rounded-3xl bg-card border border-border p-6 mb-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {record.mode === "simulator" ? "Prüfungs-Simulator" : "Themen-Modus"}
        </p>
        <h1 className="font-display text-2xl text-foreground mt-1">{record.label}</h1>
        <p className="text-sm text-muted-foreground mt-1">{formatDate(record.date)}</p>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Stat label="Note" value={record.grade} />
          <Stat label="Punkte" value={`${record.totalPoints}/${record.maxPoints}`} />
          <Stat label="Prozent" value={`${record.percent}%`} />
        </div>
        <button
          onClick={() => {
            if (confirm("Diesen Durchgang löschen?")) {
              deleteSession(record.id);
              onBack();
            }
          }}
          className="mt-5 text-xs text-muted-foreground hover:text-destructive transition"
        >
          Durchgang löschen
        </button>
      </div>

      <div className="space-y-4">
        {record.answers.map((a, i) => (
          <div key={a.questionId} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs text-muted-foreground">Frage {i + 1}</span>
              <ScorePill score={a.score} />
            </div>
            {a.caseTitle && (
              <p className="text-xs text-muted-foreground italic mb-1">{a.caseTitle}</p>
            )}
            <p className="font-medium text-foreground mb-3">{a.questionText}</p>

            <details className="group">
              <summary className="cursor-pointer text-sm text-primary font-medium hover:underline list-none">
                Deine Antwort & Musterlösung anzeigen
              </summary>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Deine Antwort
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-foreground">
                    {a.userAnswer || <em className="text-muted-foreground">leer</em>}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/40 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Musterlösung
                  </p>
                  <p className="text-sm whitespace-pre-line text-foreground">{a.modelAnswer}</p>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-display text-lg text-foreground">{value}</div>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
