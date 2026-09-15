import { ServiceIcon, serviceIcons } from './service-icons';
import type { CSSProperties } from 'react';
import type { PageSection } from './page';
export function PageBlock({
  section: s,
  preview = false,
}: {
  section: PageSection;
  preview?: boolean;
}) {
  const d = s.design;
  return (
    <section
      className={
        'page-block wrap block-' + s.type + (d ? ' has-block-design' : '') + (d?.layout ? ' layout-' + d.layout : '')
      }
      style={
        d
          ? ({
              background: d.background || undefined,
              color: d.text || undefined,
              textAlign: d.align as CSSProperties['textAlign'],
              padding: d.padding + 'px',
              '--block-columns': d.columns,
            } as CSSProperties)
          : undefined
      }
    >
      {s.image &&
        (s.type === 'hero' || s.type === 'text' || s.type === 'image') && (
          <img src={s.image} alt={s.imageAlt} />
        )}
      <div className="block-content">
        <h2>{s.title}</h2>
        <p className="article-intro">{s.description}</p>
        {s.body && <div className="article-body">
          {s.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>}
        {s.type === 'cards' && (
          <div className="service-grid">
            {s.items.map((item, i) => (
              d?.layout === 'questions' ? <details className="service-question" key={i}>
                <summary>{item.title}<span aria-hidden="true">+</span></summary>
                <p>{item.description}</p>
              </details> : <article className="service-card" key={i}>
                {['timeline','numbered','list'].includes(d?.layout || '') && <span className="card-number">{String(i+1).padStart(2,'0')}</span>}
                {item.icon && <ServiceIcon name={item.icon} />}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        )}
        {s.buttonLabel &&
          s.buttonUrl &&
          (preview ? (
            <span className="button">{s.buttonLabel} ↗</span>
          ) : (
            <a className="button" href={s.buttonUrl}>
              {s.buttonLabel} ↗
            </a>
          ))}
      </div>
    </section>
  );
}
export function SectionDesignEditor({
  section,
  onChange,
}: {
  section: PageSection;
  onChange: (s: PageSection) => void;
}) {
  const d = section.design || {
    background: '',
    text: '',
    align: 'left',
    padding: 40,
    columns: 3,
  };
  return (
    <details className="editor-group">
      <summary>Style & layout</summary>
      <div className="section-style-controls">
        <label>
          Section layout
          <select value={d.layout || 'standard'} onChange={e => onChange({...section, design:{...d,layout:e.target.value}})}>
            <option value="standard">Standard</option>
            {(section.type === 'hero' ? [['editorial','Editorial portrait'],['spotlight','Image on the left'],['panorama','Full-width photo'],['numeric','Bold statement']] : section.type === 'cards' ? [['list','Editorial rows'],['timeline','Step timeline'],['numbered','Numbered grid'],['questions','Expandable questions']] : [['reading','Editorial columns'],['banner','Centred feature']]).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {section.type === 'cards' &&
          section.items.map((item, index) => (
            <label key={index}>
              Icon for {item.title || 'card ' + (index + 1)}
              <select
                value={item.icon || ''}
                onChange={(e) =>
                  onChange({
                    ...section,
                    items: section.items.map((x, j) =>
                      j === index ? { ...x, icon: e.target.value } : x,
                    ),
                  })
                }
              >
                <option value="">No icon</option>
                {Object.keys(serviceIcons).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
          ))}
        {(['background', 'text'] as const).map((key) => (
          <label key={key}>
            {key === 'background' ? 'Section background' : 'Text colour'}
            <input
              aria-label={
                key === 'background' ? 'Section background' : 'Text colour'
              }
              type="color"
              value={d[key] || (key === 'background' ? '#061426' : '#e8f3ff')}
              onChange={(e) =>
                onChange({
                  ...section,
                  design: { ...d, [key]: e.target.value },
                })
              }
            />
          </label>
        ))}
        <label>
          Text alignment
          <select
            aria-label="Text alignment"
            value={d.align}
            onChange={(e) =>
              onChange({ ...section, design: { ...d, align: e.target.value } })
            }
          >
            <option value="left">Left</option>
            <option value="center">Centre</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label>
          Section spacing: {d.padding}px
          <input
            aria-label="Section spacing"
            type="range"
            min="0"
            max="100"
            value={d.padding}
            onChange={(e) =>
              onChange({
                ...section,
                design: { ...d, padding: Number(e.target.value) },
              })
            }
          />
        </label>
        {section.type === 'cards' && (
          <label>
            Card columns
            <select
              aria-label="Card columns"
              value={d.columns}
              onChange={(e) =>
                onChange({
                  ...section,
                  design: { ...d, columns: Number(e.target.value) },
                })
              }
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        <button
          className="button outline small"
          onClick={() => {
            const { design: _design, ...rest } = section;
            onChange(rest);
          }}
        >
          Reset to website style
        </button>
      </div>
    </details>
  );
}
