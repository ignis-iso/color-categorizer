import { useMemo, useRef, useState } from "react";
import { COLORS, GRID_SIZE } from "./colors.ts";
import { displayName, useT } from "./i18n.ts";
import { findRegions } from "./regions.ts";
import { normalize } from "./util.ts";

interface Props {
  labels: Record<number, string>;
  onApply: (idxs: number[], name: string) => void;
  onFinish: () => void;
}

const N = GRID_SIZE;
const CELL = 40;
const SIZE = N * CELL;

/** Modo "grade": o usuário seleciona quadrados na grade e dá nome a cada área. */
export default function Painter({ labels, onApply, onFinish }: Props) {
  const t = useT();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [name, setName] = useState("");
  const drag = useRef<{ adding: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const grid = useMemo(() => COLORS.map((_, i) => labels[i] ?? ""), [labels]);
  const classified = grid.filter((g) => g !== "").length;

  const nameOrder = useRef<string[]>([]);
  for (const v of Object.values(labels)) {
    if (!nameOrder.current.includes(v)) nameOrder.current.push(v);
  }
  const names = nameOrder.current.filter((n) => grid.includes(n));

  const { lines, regions } = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const me = grid[r * N + c];
        if (c + 1 < N && grid[r * N + c + 1] !== me)
          lines.push({ x1: (c + 1) * CELL, y1: r * CELL, x2: (c + 1) * CELL, y2: (r + 1) * CELL });
        if (r + 1 < N && grid[(r + 1) * N + c] !== me)
          lines.push({ x1: c * CELL, y1: (r + 1) * CELL, x2: (c + 1) * CELL, y2: (r + 1) * CELL });
      }
    }
    return { lines, regions: findRegions(grid).filter((r) => r.name !== "") };
  }, [grid]);

  const cellAt = (e: React.PointerEvent): number | null => {
    const box = svgRef.current!.getBoundingClientRect();
    const c = Math.floor(((e.clientX - box.left) / box.width) * N);
    const r = Math.floor(((e.clientY - box.top) / box.height) * N);
    return r < 0 || c < 0 || r >= N || c >= N ? null : r * N + c;
  };

  const paint = (idx: number, adding: boolean) =>
    setSelected((s) => {
      if (s.has(idx) === adding) return s;
      const n = new Set(s);
      if (adding) n.add(idx); else n.delete(idx);
      return n;
    });

  const apply = (n: string) => {
    const v = normalize(n);
    if (!v || selected.size === 0) return;
    onApply([...selected], v);
    setSelected(new Set());
    setName("");
  };

  const left = N * N - classified;

  return (
    <section className="painter">
      <p className="lead">{t.paintHint}</p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="grid paintgrid"
        onPointerDown={(e) => {
          const i = cellAt(e);
          if (i === null) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { adding: !selected.has(i) };
          paint(i, drag.current.adding);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const i = cellAt(e);
          if (i !== null) paint(i, drag.current.adding);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {COLORS.map((c, i) => (
          <rect key={i} x={(i % N) * CELL} y={Math.floor(i / N) * CELL} width={CELL + 0.5} height={CELL + 0.5} fill={c} />
        ))}
        {lines.map((l, i) => (
          <line key={i} {...l} stroke="#111" strokeWidth={3} strokeLinecap="square" />
        ))}
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="none" stroke="#111" strokeWidth={4} />
        {regions.map((rg, i) => {
          const text = displayName(rg.name);
          const fit = (CELL * Math.max(rg.width, 1) * 0.92) / (Math.max(text.length, 1) * 0.62);
          const base = rg.size > 6 ? 22 : rg.size > 2 ? 15 : 11;
          return (
            <text
              key={i}
              x={rg.c * CELL + CELL / 2}
              y={rg.r * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="region-label"
              fontSize={Math.max(8, Math.min(base, fit))}
            >
              {text}
            </text>
          );
        })}
        {[...selected].map((i) => (
          <rect
            key={`s${i}`}
            x={(i % N) * CELL + 3}
            y={Math.floor(i / N) * CELL + 3}
            width={CELL - 6}
            height={CELL - 6}
            fill="#ffffff55"
            stroke="#fff"
            strokeWidth={3}
            strokeDasharray="6 4"
            pointerEvents="none"
          />
        ))}
      </svg>

      <p className="counter">
        {t.classifiedCount(classified, N * N)} · {t.selectedCount(selected.size)}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(name);
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.nameArea}
          autoComplete="off"
          maxLength={30}
        />
        <button className="primary" type="submit" disabled={!normalize(name) || selected.size === 0}>
          {t.apply}
        </button>
      </form>

      {names.length > 0 && (
        <div className="chips">
          {names.map((n) => (
            <button key={n} type="button" className="chip" onClick={() => apply(n)}>
              {displayName(n)}
            </button>
          ))}
        </div>
      )}

      <div className="nav">
        <button type="button" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
          {t.clearSelection}
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set(grid.flatMap((g, i) => (g === "" ? [i] : []))))}
          disabled={left === 0}
        >
          {t.selectUnclassified}
        </button>
      </div>

      <div className="actions center">
        <button className="primary" onClick={onFinish} disabled={left > 0}>
          {left > 0 ? t.unclassifiedLeft(left) : t.seeResult}
        </button>
      </div>
    </section>
  );
}
