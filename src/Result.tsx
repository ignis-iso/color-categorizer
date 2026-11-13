import { useMemo } from "react";
import { COLORS, GRID_SIZE } from "./colors.ts";
import { capitalize } from "./util.ts";

interface Props {
  labels: Record<number, string>;
  onRestart: () => void;
}

const CELL = 40;
const N = GRID_SIZE;
const SIZE = CELL * N;

/** Centro (em células) do maior componente conexo de cada categoria. */
function labelPositions(grid: string[]) {
  const seen = new Array<boolean>(grid.length).fill(false);
  const best = new Map<string, { size: number; r: number; c: number }>();
  for (let s = 0; s < grid.length; s++) {
    if (seen[s]) continue;
    const name = grid[s];
    const stack = [s];
    const cells: number[] = [];
    seen[s] = true;
    while (stack.length) {
      const cur = stack.pop()!;
      cells.push(cur);
      const r = Math.floor(cur / N), c = cur % N;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const n = rr * N + cc;
        if (!seen[n] && grid[n] === name) {
          seen[n] = true;
          stack.push(n);
        }
      }
    }
    const prev = best.get(name);
    if (!prev || cells.length > prev.size) {
      // célula do componente mais próxima do centróide (para o rótulo cair dentro da região)
      const mr = cells.reduce((a, x) => a + Math.floor(x / N), 0) / cells.length;
      const mc = cells.reduce((a, x) => a + (x % N), 0) / cells.length;
      let pick = cells[0], d = Infinity;
      for (const x of cells) {
        const dd = (Math.floor(x / N) - mr) ** 2 + ((x % N) - mc) ** 2;
        if (dd < d) { d = dd; pick = x; }
      }
      best.set(name, { size: cells.length, r: Math.floor(pick / N), c: pick % N });
    }
  }
  return best;
}

export default function Result({ labels, onRestart }: Props) {
  const grid = useMemo(() => COLORS.map((_, i) => labels[i] ?? "?"), [labels]);

  const { lines, labelsPos, legend } = useMemo(() => {
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
    const count = new Map<string, number>();
    grid.forEach((g) => count.set(g, (count.get(g) ?? 0) + 1));
    return {
      lines,
      labelsPos: labelPositions(grid),
      legend: [...count.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [grid]);

  return (
    <section className="result">
      <h1>Seu gráfico de cores</h1>
      <p className="lead">
        Estas são as {legend.length} categorias que você criou para as{" "}
        {COLORS.length} cores.
      </p>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="grid" role="img">
        {COLORS.map((c, i) => (
          <rect
            key={i}
            x={(i % N) * CELL}
            y={Math.floor(i / N) * CELL}
            width={CELL + 0.5}
            height={CELL + 0.5}
            fill={c}
          />
        ))}
        {lines.map((l, i) => (
          <line key={i} {...l} stroke="#111" strokeWidth={3} strokeLinecap="square" />
        ))}
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="none" stroke="#111" strokeWidth={4} />
        {[...labelsPos.entries()].map(([name, p]) => (
          <text
            key={name}
            x={p.c * CELL + CELL / 2}
            y={p.r * CELL + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="region-label"
            fontSize={p.size > 6 ? 22 : p.size > 2 ? 15 : 11}
          >
            {capitalize(name)}
          </text>
        ))}
      </svg>

      <ul className="legend">
        {legend.map(([name, n]) => {
          const avg = averageColor(grid, name);
          return (
            <li key={name}>
              <i style={{ background: avg }} />
              {capitalize(name)} <span>{n}</span>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button className="primary" onClick={onRestart}>
          Refazer o teste
        </button>
      </div>
    </section>
  );
}

function averageColor(grid: string[], name: string): string {
  let r = 0, g = 0, b = 0, n = 0;
  grid.forEach((l, i) => {
    if (l !== name) return;
    const h = COLORS[i];
    r += parseInt(h.slice(1, 3), 16);
    g += parseInt(h.slice(3, 5), 16);
    b += parseInt(h.slice(5, 7), 16);
    n++;
  });
  return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
}
