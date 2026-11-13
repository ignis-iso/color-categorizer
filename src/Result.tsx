import { useMemo, useState } from "react";
import { COLORS, GRID_SIZE } from "./colors.ts";
import { capitalize } from "./util.ts";

interface Props {
  labels: Record<number, string>;
  onRestart: () => void;
  onChange: (idx: number, name: string) => void;
}

const CELL = 40;
const N = GRID_SIZE;
const SIZE = CELL * N;

interface Region {
  name: string;
  size: number;
  r: number;
  c: number;
  width: number; // largura em células do retângulo envolvente
}

const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/** Regiões = componentes conexos (8 vizinhos) de cada categoria; cada uma ganha um rótulo. */
function findRegions(grid: string[]): Region[] {
  const seen = new Array<boolean>(grid.length).fill(false);
  const regions: Region[] = [];
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
      for (const [dr, dc] of DIRS8) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const n = rr * N + cc;
        if (!seen[n] && grid[n] === name) {
          seen[n] = true;
          stack.push(n);
        }
      }
    }
    const mr = cells.reduce((a, x) => a + Math.floor(x / N), 0) / cells.length;
    const mc = cells.reduce((a, x) => a + (x % N), 0) / cells.length;
    let pick = cells[0], d = Infinity;
    for (const x of cells) {
      const dd = (Math.floor(x / N) - mr) ** 2 + ((x % N) - mc) ** 2;
      if (dd < d) { d = dd; pick = x; }
    }
    const cols = cells.map((x) => x % N);
    regions.push({
      name,
      size: cells.length,
      r: Math.floor(pick / N),
      c: pick % N,
      width: Math.max(...cols) - Math.min(...cols) + 1,
    });
  }
  return regions;
}

/**
 * Ligações diagonais necessárias: pares da mesma categoria que só se tocam pela quina
 * E que ainda não estão conectados (por lados) em outro lugar. Se já fazem parte do
 * mesmo bloco contínuo, a ligação seria redundante e não é desenhada.
 */
function diagonalLinks(grid: string[]) {
  const parent = Array.from({ length: grid.length }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const i = r * N + c;
      if (c + 1 < N && grid[i] === grid[i + 1]) union(i, i + 1);
      if (r + 1 < N && grid[i] === grid[i + N]) union(i, i + N);
    }
  }
  const links: { r1: number; c1: number; r2: number; c2: number }[] = [];
  for (let r = 0; r + 1 < N; r++) {
    for (let c = 0; c < N; c++) {
      const a = grid[r * N + c];
      for (const dc of [1, -1]) {
        const c2 = c + dc;
        if (c2 < 0 || c2 >= N) continue;
        if (grid[(r + 1) * N + c2] !== a) continue;
        if (grid[r * N + c2] === a || grid[(r + 1) * N + c] === a) continue;
        const i1 = r * N + c, i2 = (r + 1) * N + c2;
        if (find(i1) === find(i2)) continue;
        union(i1, i2);
        links.push({ r1: r, c1: c, r2: r + 1, c2 });
      }
    }
  }
  return links;
}

export default function Result({ labels, onRestart, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const grid = useMemo(() => COLORS.map((_, i) => labels[i] ?? "?"), [labels]);

  const { lines, regions, links, legend } = useMemo(() => {
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
      regions: findRegions(grid),
      links: diagonalLinks(grid),
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

      <div className="editbar">
        <button
          onClick={() => {
            setEditing(!editing);
            setSelected(null);
          }}
          className={editing ? "primary" : ""}
        >
          {editing ? "Concluir edição" : "Editar resultado"}
        </button>
        {editing && (
          <span>Clique em um quadrado e escolha uma das suas categorias.</span>
        )}
      </div>

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
        {links.map((l, i) => {
          const p = {
            x1: l.c1 * CELL + CELL / 2, y1: l.r1 * CELL + CELL / 2,
            x2: l.c2 * CELL + CELL / 2, y2: l.r2 * CELL + CELL / 2,
          };
          return (
            <g key={`l${i}`} strokeLinecap="round">
              <line {...p} stroke="#111" strokeWidth={9} />
              <line {...p} stroke="#fff" strokeWidth={4} strokeDasharray="1 7" />
            </g>
          );
        })}
        {regions.map((rg, i) => {
          const len = Math.max(rg.name.length, 1);
          const fit = (CELL * Math.max(rg.width, 1) * 0.92) / (len * 0.62);
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
              {capitalize(rg.name)}
            </text>
          );
        })}
        {editing &&
          COLORS.map((_, i) => (
            <rect
              key={`h${i}`}
              x={(i % N) * CELL}
              y={Math.floor(i / N) * CELL}
              width={CELL}
              height={CELL}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(i === selected ? null : i)}
            />
          ))}
        {editing && selected !== null && (
          <rect
            x={(selected % N) * CELL + 2}
            y={Math.floor(selected / N) * CELL + 2}
            width={CELL - 4}
            height={CELL - 4}
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            strokeDasharray="6 4"
            pointerEvents="none"
          />
        )}
      </svg>

      {editing && selected !== null && (
        <div className="editpanel">
          <i className="mini" style={{ background: COLORS[selected] }} />
          <span>
            Atual: <strong>{capitalize(grid[selected])}</strong>. Mover para:
          </span>
          <div className="chips">
            {legend.map(([name]) => (
              <button
                key={name}
                className={name === grid[selected] ? "chip active" : "chip"}
                disabled={name === grid[selected]}
                onClick={() => {
                  onChange(selected, name);
                  setSelected(null);
                }}
              >
                {capitalize(name)}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="hint">
        Pontilhado preto e branco ligando duas células = elas pertencem à mesma categoria, mesmo se tocando só pela diagonal.
      </p>

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
