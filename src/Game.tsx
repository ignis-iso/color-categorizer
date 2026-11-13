import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS } from "./colors.ts";
import { capitalize, normalize } from "./util.ts";

interface Props {
  order: number[];
  labels: Record<number, string>;
  onAnswer: (idx: number, name: string) => void;
  onFinish: () => void;
}

export default function Game({ order, labels, onAnswer, onFinish }: Props) {
  // Começa na primeira cor ainda sem nome (útil ao retomar).
  const [pos, setPos] = useState(() => {
    const first = order.findIndex((i) => labels[i] === undefined);
    return first === -1 ? order.length - 1 : first;
  });
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const idx = order[pos];
  const color = COLORS[idx];
  const done = Object.keys(labels).length;

  // Categorias já usadas, da mais frequente para a menos.
  const used = useMemo(() => {
    const count = new Map<string, number>();
    for (const v of Object.values(labels)) count.set(v, (count.get(v) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [labels]);

  useEffect(() => {
    setText(labels[idx] ?? "");
    inputRef.current?.focus();
    // deno-lint-ignore react-hooks/exhaustive-deps
  }, [pos]);

  const submit = (name: string) => {
    const n = normalize(name);
    if (!n) return;
    onAnswer(idx, n);
    if (pos + 1 < order.length) setPos(pos + 1);
    else if (done + (labels[idx] === undefined ? 1 : 0) >= COLORS.length) onFinish();
  };

  const allDone = done >= COLORS.length;
  const typed = normalize(text);
  const isNew = typed !== "" && !used.some(([n]) => n === typed);

  return (
    <section className="game">
      <div className="progress" aria-label="progresso">
        <div className="bar" style={{ width: `${(done / COLORS.length) * 100}%` }} />
      </div>
      <p className="counter">
        Cor {pos + 1} de {COLORS.length} · {used.length} categoria
        {used.length === 1 ? "" : "s"} em uso
      </p>

      <div className="swatch" style={{ background: color }} />

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
          placeholder="Que cor é essa?"
          autoComplete="off"
          maxLength={30}
        />
        <button className="primary" type="submit" disabled={!typed}>
          {pos + 1 === order.length ? "Concluir" : "Próxima"}
        </button>
      </form>

      {isNew && used.length >= 12 && (
        <p className="warn">
          Você já tem {used.length} categorias — tente reaproveitar uma delas.
        </p>
      )}

      {used.length > 0 && (
        <div className="chips">
          {used.map(([name, n]) => (
            <button
              key={name}
              type="button"
              className={name === typed ? "chip active" : "chip"}
              onClick={() => submit(name)}
            >
              {capitalize(name)} <span>{n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="nav">
        <button type="button" disabled={pos === 0} onClick={() => setPos(pos - 1)}>
          ← Voltar
        </button>
        {allDone && (
          <button type="button" onClick={onFinish}>
            Ver resultado
          </button>
        )}
      </div>
    </section>
  );
}
