import { useEffect, useMemo, useState } from "react";
import { normalize, startOrder } from "./util.ts";
import Intro from "./Intro.tsx";
import Game from "./Game.tsx";
import Result from "./Result.tsx";
import Painter from "./Painter.tsx";
import { getLang, LANGS, setLang, useT, type Lang } from "./i18n.ts";
import type { Mode, Size } from "./modes.ts";

type Phase = "intro" | "play" | "result";
const KEY = "color-categorizer:v1";

// mode/size são opcionais: saves antigos (sem eles) são tratados como "livre" e 256 cores.
interface Saved {
  order: number[];
  labels: Record<number, string>;
  mode?: Mode;
  size?: Size;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const answeredCount = (order: number[], labels: Record<number, string>) =>
  order.filter((i) => labels[i] !== undefined).length;

export default function App() {
  const t = useT();
  const saved = useMemo(load, []);
  const [phase, setPhase] = useState<Phase>("intro");
  const [order, setOrder] = useState<number[]>([]);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [mode, setMode] = useState<Mode>("free");
  const [size, setSize] = useState<Size>(256);

  useEffect(() => {
    if (order.length === 0) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ order, labels, mode, size }));
    } catch { /* ignore */ }
  }, [order, labels, mode, size]);

  const start = () => {
    setOrder(startOrder(mode === "grid" ? 256 : size));
    setLabels({});
    setPhase("play");
  };

  const resume = () => {
    if (!saved) return;
    setOrder(saved.order);
    setLabels(saved.labels);
    setMode(saved.mode ?? "free");
    setSize((saved.size ?? (saved.order.length as Size)) as Size);
    setPhase(answeredCount(saved.order, saved.labels) >= saved.order.length ? "result" : "play");
  };

  const restart = () => {
    try {
      localStorage.removeItem(KEY);
    } catch { /* ignore */ }
    setPhase("intro");
  };

  const answer = (idx: number, name: string) =>
    setLabels((l) => ({ ...l, [idx]: name.startsWith("@") ? name : normalize(name) }));

  const applyMany = (idxs: number[], name: string) =>
    setLabels((l) => {
      const next = { ...l };
      for (const i of idxs) next[i] = normalize(name);
      return next;
    });

  const progress = saved && saved.order.length > 0 ? answeredCount(saved.order, saved.labels) : 0;

  return (
    <main className={`app app-${phase}`}>
      <select
        className="lang"
        aria-label={t.language}
        value={getLang()}
        onChange={(e) => setLang(e.target.value as Lang)}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      {phase === "intro" && (
        <Intro
          mode={mode}
          size={size}
          onMode={setMode}
          onSize={setSize}
          onStart={start}
          onResume={saved && progress > 0 ? resume : undefined}
          resumeLabel={saved ? t.resume(progress, saved.order.length) : ""}
        />
      )}
      {phase === "play" && mode === "grid" && (
        <Painter labels={labels} onApply={applyMany} onFinish={() => setPhase("result")} />
      )}
      {phase === "play" && mode !== "grid" && (
        <Game
          order={order}
          labels={labels}
          mode={mode}
          onAnswer={answer}
          onFinish={() => setPhase("result")}
        />
      )}
      {phase === "result" && (
        <Result labels={labels} total={order.length} mode={mode} onRestart={restart} onChange={answer} />
      )}
    </main>
  );
}
