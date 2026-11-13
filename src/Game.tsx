import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS } from "./colors.ts";
import { normalize } from "./util.ts";
import { displayName, useT } from "./i18n.ts";
import { CAT_COLORS, isFixed, modeCategories, type Mode } from "./modes.ts";

interface Props {
  order: number[];
  labels: Record<number, string>;
  mode: Mode;
  onAnswer: (idx: number, name: string) => void;
  onFinish: () => void;
}

export default function Game({ order, labels, mode, onAnswer, onFinish }: Props) {
  const t = useT();
  const fixed = isFixed(mode);
  const fixedCats = modeCategories(mode);
  const total = order.length;
  // Começa na primeira cor ainda sem nome (útil ao retomar).
  const [pos, setPos] = useState(() => {
    const first = order.findIndex((i) => labels[i] === undefined);
    return first === -1 ? order.length - 1 : first;
  });
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Quando a ação veio de um toque nas pílulas/voltar, não devolve o foco ao campo
  // (evita o teclado do celular reabrir).
  const skipFocus = useRef(false);

  const idx = order[pos];
  const color = COLORS[idx];
  const done = order.filter((i) => labels[i] !== undefined).length;

  // Ordem fixa das categorias: a da primeira vez que cada nome apareceu.
  // Ao retomar, reconstrói pela ordem de jogo; depois só acrescenta novos nomes no fim.
  const nameOrder = useRef<string[]>(
    [...new Set(order.map((i) => labels[i]).filter((n): n is string => n !== undefined))],
  );
  for (const n of Object.values(labels)) {
    if (!nameOrder.current.includes(n)) nameOrder.current.push(n);
  }

  const used = useMemo(() => {
    const count = new Map<string, number>();
    for (const v of Object.values(labels)) count.set(v, (count.get(v) ?? 0) + 1);
    if (fixed) return fixedCats.map((n): [string, number] => [n, count.get(n) ?? 0]);
    return nameOrder.current
      .filter((n) => count.has(n))
      .map((n): [string, number] => [n, count.get(n)!]);
  }, [labels]);

  useEffect(() => {
    setText(labels[idx] ?? "");
    if (!skipFocus.current && !fixed) inputRef.current?.focus();
    skipFocus.current = false;
    // deno-lint-ignore react-hooks/exhaustive-deps
  }, [pos]);

  const submit = (name: string) => {
    const n = fixed ? name : normalize(name);
    if (!n) return;
    onAnswer(idx, n);
    if (pos + 1 < order.length) setPos(pos + 1);
    else if (done + (labels[idx] === undefined ? 1 : 0) >= total) onFinish();
  };

  const allDone = done >= total;
  const typed = normalize(text);
  const isNew = typed !== "" && !used.some(([n]) => n === typed);

  return (
    <section className="game">
      <div className="progress" aria-label={t.progressLabel}>
        <div className="bar" style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <p className="counter">
        {fixed ? `${pos + 1} / ${total}` : t.counter(pos + 1, total, used.length)}
      </p>

      <div className="swatch" style={{ background: color }} />

      {!fixed && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          autoComplete="off"
          maxLength={30}
        />
        <button className="primary" type="submit" disabled={!typed}>
          {pos + 1 === order.length ? t.finish : t.next}
        </button>
      </form>
      )}

      {!fixed && isNew && used.length >= 12 && (
        <p className="warn">
          {t.tooMany(used.length)}
        </p>
      )}

      {used.length > 0 && (
        <div className={fixed ? "chips fixed" : "chips"}>
          {used.map(([name, n]) => (
            <button
              key={name}
              type="button"
              className={name === (fixed ? labels[idx] : typed) ? "chip active" : "chip"}
              onClick={() => {
                skipFocus.current = true;
                submit(name);
              }}
            >
              {fixed && <i className="dot" style={{ background: CAT_COLORS[name] }} />}
              {displayName(name)} {!fixed && <span>{n}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="nav">
        <button type="button" disabled={pos === 0} onClick={() => {
            skipFocus.current = true;
            setPos(pos - 1);
          }}>
          {t.back}
        </button>
        {allDone && (
          <button type="button" onClick={onFinish}>
            {t.seeResult}
          </button>
        )}
      </div>
    </section>
  );
}
