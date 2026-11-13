import { useT } from "./i18n.ts";
import { MODES, SIZES, type Mode, type Size } from "./modes.ts";

interface Props {
  mode: Mode;
  size: Size;
  onMode: (m: Mode) => void;
  onSize: (s: Size) => void;
  onStart: () => void;
  onResume?: () => void;
  resumeLabel: string;
}

export default function Intro({ mode, size, onMode, onSize, onStart, onResume, resumeLabel }: Props) {
  const t = useT();
  return (
    <section className="card intro">
      <h1>{t.titleTpl(t.titleColors[0])}</h1>
      <p className="lead">{t.introLead(mode === "grid" ? 256 : size)}</p>

      <h2>{t.modeTitle}</h2>
      <div className="options">
        {MODES.map((m) => (
          <div key={m} className="optwrap">
            <button
              type="button"
              className={m === mode ? "option active" : "option"}
              onClick={() => onMode(m)}
            >
              <strong>{t.modes[m].name}</strong>
              <span>{t.modes[m].desc}</span>
            </button>
            {m === "free" && <small className="rec">{t.recommended}</small>}
          </div>
        ))}
      </div>

      <p className="modedesc">{t.modes[mode].long}</p>

      {mode !== "grid" && <h2>{t.sizeTitle}</h2>}
      {mode !== "grid" && (
      <div className="options sizes">
        {SIZES.map((s) => (
          <div key={s} className="optwrap">
            <button
              type="button"
              className={s === size ? "option active" : "option"}
              onClick={() => onSize(s)}
            >
              <strong>{t.sizeOpt(s)}</strong>
            </button>
            {s === 256 && <small className="rec">{t.recommended}</small>}
          </div>
        ))}
      </div>
      )}

      <h2>{t.howTitle}</h2>
      <ol>
        {t.how.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ol>

      <h2>{t.beforeTitle}</h2>
      {mode === "free" || mode === "grid"
        ? (
          <ul className="tips">
            {(mode === "grid" ? [["", t.gridTip] as [string, string], ...t.tips.slice(0, 2)] : t.tips).map(([b, rest], i) => (
              <li key={i}>
                {b && <strong>{b}</strong>}
                {rest}
              </li>
            ))}
          </ul>
        )
        : (
          <ul className="tips">
            <li>{t.fixedTip}</li>
            <li>{t.tips[t.tips.length - 1][1]}</li>
          </ul>
        )}

      <div className="actions">
        <button className="primary" onClick={onStart}>
          {t.start}
        </button>
        {onResume && <button onClick={onResume}>{resumeLabel}</button>}
      </div>
    </section>
  );
}
