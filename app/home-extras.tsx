import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Flag,
  Layers,
  Check,
} from 'lucide-react';
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
  const [active, setActive] = useState(0);
  const choice = s.items[Math.min(active, s.items.length - 1)];
  const icons = [Flag, Layers, Compass];
  return (
    <div className="wrap consultation-guide">
      <div className="guide-heading">
        <div className="eyebrow">{s.eyebrow}</div>
        <h2>
          {s.title} <em>{s.highlight}</em>
        </h2>
        <p>{s.description}</p>
      </div>
      <div className="guide-layout">
        <div className="guide-options" aria-label="Choose your concern">
          {s.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <button
                key={i}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <span className="guide-icon">
                  <Icon size={24} />
                </span>
                <span>{item.title}</span>
                <span className="guide-radio">
                  {active === i && <Check size={13} />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="guide-result" aria-live="polite">
          {choice ? (
            <>
              <span className="eyebrow">{choice.title}</span>
              <h3>{choice.subtitle}</h3>
              <p>{choice.description}</p>
              <ul>
                {choice.features
                  ?.split('\n')
                  .filter(Boolean)
                  .map((f, i) => (
                    <li key={i}>
                      <Check size={15} />
                      {f}
                    </li>
                  ))}
              </ul>
              <a
                className="button"
                href="#contact"
                onClick={() => onSelect(choice.subtitle || '')}
              >
                {buttonLabel}
                <ArrowUpRight size={17} />
              </a>
            </>
          ) : (
            <p>{s.description}</p>
          )}
        </div>
      </div>
      <p className="guide-note">{s.body}</p>
    </div>
  );
}
