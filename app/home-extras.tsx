import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Compass, Check } from 'lucide-react';
import type { Section } from './page';
export function BusinessMilestones({
  s,
  buttonLabel,
}: {
  s: Section;
  buttonLabel: string;
}) {
  const [active, setActive] = useState(0);
  const selected = s.items[Math.min(active, s.items.length - 1)];
  return (
    <div className="wrap milestones-layout">
      <div className="milestones-intro">
        <div className="eyebrow">
          <span className="line" />
          {s.eyebrow}
        </div>
        <h2>
          {s.title}
          <br />
          <em>{s.highlight}</em>
        </h2>
        <p>{s.description}</p>
        <div className="milestone-choices" aria-label="Business chapter">
          {s.items.map((item, i) => (
            <button
              key={i}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {item.title}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="milestone-detail">
        <div className="chapter-orbit" aria-hidden="true">
          <i />
          <i />
          <Compass size={62} strokeWidth={0.8} />
          <span>✦</span>
        </div>
        {selected && (
          <div className="chapter-content">
            <span className="eyebrow">{selected.subtitle}</span>
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
            <ul>
              {selected.features
                ?.split('\n')
                .filter(Boolean)
                .map((f, i) => (
                  <li key={i}>
                    <Check size={15} />
                    {f}
                  </li>
                ))}
            </ul>
          </div>
        )}
        <div className="chapter-bottom">
          <p>{s.body}</p>
          <a href="#contact" className="textlink">
            {buttonLabel}
            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
export function ConsultationPreparation({
  s,
  buttonLabel,
  onSelect,
}: {
  s: Section;
  buttonLabel: string;
  onSelect: (service: string) => void;
}) {
  return (
    <div className="practice-section">
      <div className="practice-heading wrap">
        <div className="eyebrow">{s.eyebrow}</div>
        <h2>
          {s.title} <em>{s.highlight}</em>
        </h2>
        {s.description && <p>{s.description}</p>}
      </div>
      <div className="practice-columns">
        {s.items.map((item, i) => (
          <article className="practice-panel" key={i}>
            {item.image && (
              <img
                className="practice-image"
                src={item.image}
                alt={item.imageAlt || item.title}
                loading="lazy"
                width="220"
                height="220"
              />
            )}
            <h3>{item.title}</h3>
            <div className="practice-ornament" aria-hidden="true">
              <span />
              <i>✧</i>
              <span />
            </div>
            <p>{item.description}</p>
            <a
              href="#contact"
              onClick={() => onSelect(item.subtitle || item.title)}
              className="practice-link"
            >
              <span aria-hidden="true">✦</span>
              {buttonLabel}
              <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </div>
      {s.body && <p className="practice-note wrap">{s.body}</p>}
    </div>
  );
}
