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
}: {
  s: Section;
  buttonLabel: string;
}) {
  const icons = [Flag, Layers, Compass];
  return (
    <div className="wrap preparation-wrap">
      <div className="preparation-title">
        <div className="eyebrow">{s.eyebrow}</div>
        <h2>
          {s.title} <em>{s.highlight}</em>
        </h2>
        <p>{s.description}</p>
      </div>
      <div className="preparation-cards">
        {s.items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
            <article key={i}>
              <div className="preparation-card-top">
                <Icon size={28} strokeWidth={1.2} />
                <span>0{i + 1}</span>
              </div>
              <div className="eyebrow">{item.subtitle}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
      <div className="preparation-bottom">
        <p>{s.body}</p>
        <a href="#contact" className="button outline">
          {buttonLabel}
          <ArrowUpRight size={17} />
        </a>
      </div>
    </div>
  );
}
