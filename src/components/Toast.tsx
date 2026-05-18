import { useEffect, useState } from "react";
import { pickOne } from "@/lib/cheers";

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 safe-top">
      <div className="animate-pop glass border border-border rounded-full px-5 py-3 shadow-xl max-w-sm text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}

// Manager hook: every Nth correct shows a cheer; encouragements rarer.
export function useFeedbackToaster() {
  const [msg, setMsg] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  function onCorrect(messages: string[]) {
    const next = correctCount + 1;
    setCorrectCount(next);
    // every ~3rd correct, randomised
    if (next % 3 === 0 || (next > 1 && Math.random() < 0.25)) {
      setMsg(pickOne(messages));
    }
  }

  function onWrong(messages: string[]) {
    const next = wrongCount + 1;
    setWrongCount(next);
    if (Math.random() < 0.4 || next === 1) {
      setMsg(pickOne(messages));
    }
  }

  const node = msg ? <Toast message={msg} onDone={() => setMsg(null)} /> : null;
  return { node, onCorrect, onWrong };
}
