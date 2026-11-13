import { useMemo, useState } from "react";
import { COLORS, GRID_SIZE } from "./colors.ts";
import { fillGrid, normalize } from "./util.ts";
import { CAT_COLORS, modeCategories, type Mode } from "./modes.ts";
import { diagonalLinks, findRegions } from "./regions.ts";
import ShareModal from "./ShareModal.tsx";
import { displayName, useT } from "./i18n.ts";

interface Props {
  labels: Record<number, string>;
  total: number;
  mode: Mode;
  onRestart: () => void;
  onChange: (idx: number, name: string) => void;
}

const CELL = 40;
const N = GRID_SIZE;
const SIZE = CELL * N;

export default function Result({ labels, total, mode, onRestart, onChange }: Props) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [sharing, setSharing] = useState(false);
  const assign = (name: string) => {
    if (selected === null || !normalize(name)) return;
    onChange(selected, name);
    setSelected(null);
    setNewName("");
  };
  const grid = useMemo(() => fillGrid(labels), [labels]);
  const fixedCats = modeCategories(mode);

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
      <h1>{t.resultTitle}</h1>
      <p className="lead">
        {t.resultLead(legend.length, total)}
      </p>

      <div className="editbar">
        <button
          onClick={() => {
            setEditing(!editing);
            setSelected(null);
          }}
          className={editing ? "primary" : ""}
        >
          {editing ? t.doneEditing : t.edit}
        </button>
        {editing && (
          <span>{fixedCats.length ? t.editHintFixed : t.editHint}</span>
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
              {displayName(rg.name)}
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
            {t.current}: <strong>{displayName(grid[selected])}</strong>. {t.moveTo}
          </span>
          <div className="chips">
            {(fixedCats.length ? fixedCats.map((n) => [n]) : legend).map(([name]) => (
              <button
                key={name}
                className={name === grid[selected] ? "chip active" : "chip"}
                disabled={name === grid[selected]}
                onClick={() => assign(name)}
              >
                {fixedCats.length > 0 && <i className="dot" style={{ background: CAT_COLORS[name] }} />}
                {displayName(name)}
              </button>
            ))}
          </div>
          {fixedCats.length === 0 && (
          <form
            className="newcat"
            onSubmit={(e) => {
              e.preventDefault();
              assign(newName);
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.newCategory}
              maxLength={30}
            />
            <button type="submit" disabled={!normalize(newName)}>
              {t.createMove}
            </button>
          </form>
          )}
        </div>
      )}

      {total < COLORS.length && <p className="note">{t.inferNote(total)}</p>}
      <p className="hint">
        {t.diagHint}
      </p>

      <ul className="legend">
        {legend.map(([name, n]) => {
          const avg = averageColor(grid, name);
          return (
            <li key={name}>
              <i style={{ background: avg }} />
              {displayName(name)} <span>{n}</span>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button className="primary" onClick={() => setSharing(true)}>
          {t.shareImage}
        </button>
        <button onClick={onRestart}>
          {t.restart}
        </button>
      </div>
      {sharing && <ShareModal grid={grid} onClose={() => setSharing(false)} />}
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
