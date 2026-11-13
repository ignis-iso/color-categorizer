import { useEffect, useMemo, useState } from "react";
import { COLORS } from "./colors.ts";
import { normalize, shuffle } from "./util.ts";
import Intro from "./Intro.tsx";
import Game from "./Game.tsx";
import Result from "./Result.tsx";

type Phase = "intro" | "play" | "result";
const KEY = "color-categorizer:v1";

interface Saved {
  order: number[];
  labels: Record<number, string>;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [order, setOrder] = useState<number[]>([]);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const saved = useMemo(load, []);

  useEffect(() => {
    if (order.length === 0) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ order, labels }));
    } catch { /* ignore */ }
  }, [order, labels]);

  const start = () => {
    setOrder(shuffle(COLORS.map((_, i) => i)));
    setLabels({});
    setPhase("play");
  };

  const resume = () => {
    if (!saved) return;
    setOrder(saved.order);
    setLabels(saved.labels);
    setPhase(Object.keys(saved.labels).length >= COLORS.length ? "result" : "play");
  };

  const restart = () => {
    try {
      localStorage.removeItem(KEY);
    } catch { /* ignore */ }
    setPhase("intro");
  };

  const answer = (idx: number, name: string) =>
    setLabels((l) => ({ ...l, [idx]: normalize(name) }));

  const progress = saved && saved.order.length > 0 ? Object.keys(saved.labels).length : 0;

  return (
    <main className={`app app-${phase}`}>
      {phase === "intro" && (
        <Intro
          onStart={start}
          onResume={progress > 0 && progress <= COLORS.length ? resume : undefined}
          resumeCount={progress}
        />
      )}
      {phase === "play" && (
        <Game
          order={order}
          labels={labels}
          onAnswer={answer}
          onFinish={() => setPhase("result")}
        />
      )}
      {phase === "result" && <Result labels={labels} onRestart={restart} />}
    </main>
  );
}
