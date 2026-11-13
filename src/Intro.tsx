import { COLORS } from "./colors.ts";
import { useT } from "./i18n.ts";

interface Props {
  onStart: () => void;
  onResume?: () => void;
  resumeCount: number;
}

export default function Intro({ onStart, onResume, resumeCount }: Props) {
  const t = useT();
  return (
    <section className="card intro">
      <h1>{t.titleTpl(t.titleColors[0])}</h1>
      <p className="lead">{t.introLead(COLORS.length)}</p>

      <h2>{t.howTitle}</h2>
      <ol>
        {t.how.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ol>

      <h2>{t.beforeTitle}</h2>
      <ul className="tips">
        {t.tips.map(([b, rest], i) => (
          <li key={i}>
            {b && <strong>{b}</strong>}
            {rest}
          </li>
        ))}
      </ul>

      <div className="actions">
        <button className="primary" onClick={onStart}>
          {t.start}
        </button>
        {onResume && (
          <button onClick={onResume}>{t.resume(resumeCount, COLORS.length)}</button>
        )}
      </div>
    </section>
  );
}
