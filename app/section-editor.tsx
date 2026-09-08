import { useState, type ComponentType } from 'react';
import { ArrowUp, ArrowDown, Plus, Eye, Copy, Trash2 } from 'lucide-react';
import type { Content, Section } from './page';
const names: Record<string, string> = {
  hero: 'Hero & 3D chakra',
  industries: 'Industries we serve',
  services: 'Business challenges',
  about: 'About Tejas Parikh',
  process: 'Consultation process',
  pricing: 'Consultation pricing',
  faq: 'Questions & answers',
  contact: 'Contact & enquiry form',
  'business-milestones': 'Business milestones',
  'consultation-preparation': 'Our four disciplines',
  'industrial-questions': 'Business questions',
  'industrial-scenarios': 'Industrial scenarios',
};
const sectionName = (s: Section) => names[s.id] || s.title || 'Custom section';
function fields(s: Section) {
  const heading = ['eyebrow', 'title', 'highlight', 'description'];
  const extra: Record<string, string[]> = {
    hero: ['body'],
    industries: [],
    services: ['items'],
    about: ['body', 'image', 'imageAlt', 'items'],
    process: ['items'],
    pricing: ['items', 'body'],
    faq: ['items'],
    contact: ['body'],
    'business-milestones': ['items', 'body'],
    'consultation-preparation': ['items', 'body'],
    'industrial-questions': ['items', 'body'],
    'industrial-scenarios': ['items', 'body'],
  };
  const keys =
    s.id === 'industries'
      ? ['title', 'items']
      : [
          ...heading,
          ...(extra[s.id] || ['body', 'image', 'imageAlt', 'items']),
        ];
  return Object.fromEntries(keys.map((k) => [k, (s as any)[k]]));
}
export function HomeSectionEditor({
  data,
  onChange,
  selected,
  onSelect,
  Editor,
  navigate,
}: {
  data: Content;
  onChange: (c: Content) => void;
  selected: number;
  onSelect: (n: number) => void;
  Editor: ComponentType<any>;
  navigate: (view: string, group?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const s = data.sections[selected];
  function patch(index: number, changes: Partial<Section>) {
    onChange({
      ...data,
      sections: data.sections.map((x, i) =>
        i === index ? { ...x, ...changes } : x,
      ),
    });
  }
  function move(index: number, delta: number) {
    const a = [...data.sections];
    const current = s?.id;
    [a[index], a[index + delta]] = [a[index + delta], a[index]];
    onChange({ ...data, sections: a });
    onSelect(a.findIndex((x) => x.id === current));
  }
  function add() {
    onChange({
      ...data,
      sections: [
        ...data.sections,
        {
          id: 'custom-' + crypto.randomUUID(),
          visible: true,
          eyebrow: 'YOUR SECTION',
          title: 'New section',
          highlight: '',
          description: 'Introduce this section.',
          body: '',
          image: '',
          imageAlt: '',
          items: [],
        },
      ],
    });
    onSelect(data.sections.length);
  }
  return (
    <div className="section-workspace">
      <div className="section-toolbar">
        <div>
          <h2>Manage your homepage</h2>
          <p>
            Edit content, show or hide sections, and change their order. Save a
            draft before previewing.
          </p>
        </div>
        <button className="button small" onClick={add}>
          <Plus size={16} />
          Add section
        </button>
      </div>
      <div className="section-shortcuts">
        {[
          ['Header & menu', 'settings', 'navigation'],
          ['Footer & contact', 'settings', 'contact'],
          ['Blog section', 'posts', ''],
          ['Colours & buttons', 'settings', 'theme'],
          ['Page builder', 'pages', ''],
          ['Media library', 'media', ''],
        ].map(([text, view, group]) => (
          <button key={text} onClick={() => navigate(view, group)}>
            {text} →
          </button>
        ))}
      </div>
      <div className="section-manager-grid">
        <aside className="section-catalog">
          <label className="section-search">
            Find a section
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or heading"
              type="search"
            />
          </label>
          <p className="section-count">
            {data.sections.length} sections ·{' '}
            {data.sections.filter((x) => x.visible).length} visible
          </p>
          {data.sections
            .map((x, i) => ({ x, i }))
            .filter(({ x }) =>
              (sectionName(x) + ' ' + x.title)
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map(({ x, i }) => (
              <article
                key={x.id}
                className={'section-entry ' + (selected === i ? 'active' : '')}
              >
                <button className="section-pick" onClick={() => onSelect(i)}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <strong>{sectionName(x)}</strong>
                </button>
                <div className="section-entry-actions">
                  <button
                    className={'visibility-pill ' + (x.visible ? 'shown' : '')}
                    aria-label={
                      (x.visible ? 'Hide ' : 'Show ') + sectionName(x)
                    }
                    onClick={() => patch(i, { visible: !x.visible })}
                  >
                    {x.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    aria-label={'Move ' + sectionName(x) + ' up'}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    aria-label={'Move ' + sectionName(x) + ' down'}
                    disabled={i === data.sections.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>
              </article>
            ))}
        </aside>
        <div className="editor-panel section-detail">
          {!s ? (
            <>
              <span className="eyebrow">HOMEPAGE EDITOR</span>
              <h2>Select a section to edit</h2>
              <p>
                Choose a section from the list. Each editor shows the fields
                used by that section on your website.
              </p>
              <p>
                Use Pages to build additional pages with text, images, cards and
                buttons. Posts manages the three latest articles shown on your
                homepage.
              </p>
            </>
          ) : (
            <>
              <div className="section-detail-heading">
                <div>
                  <span className="eyebrow">SECTION {selected + 1}</span>
                  <h2>{sectionName(s)}</h2>
                </div>
                <a
                  className="button outline small"
                  href={'/?preview=1#' + s.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye size={15} />
                  Preview saved draft
                </a>
              </div>
              <label className="section-visibility">
                <input
                  type="checkbox"
                  checked={s.visible}
                  onChange={(e) =>
                    patch(selected, { visible: e.target.checked })
                  }
                />
                Show this section on the website
              </label>
              <Editor
                key={s.id}
                value={fields(s)}
                path={'section:' + s.id}
                onChange={(v: any) => patch(selected, v)}
              />
              {s.id === 'hero' && (
                <details className="editor-group" open>
                  <summary>3D chakra & hero buttons</summary>
                  <p>
                    The interactive chakra uses your website accent colours.
                    Update its caption and hero button text below.
                  </p>
                  <Editor
                    value={{
                      heroNote: data.heroNote,
                      caption: data.artTag.caption,
                      book: data.labels.book,
                      explore: data.labels.explore,
                    }}
                    onChange={(v: any) =>
                      onChange({
                        ...data,
                        heroNote: v.heroNote,
                        artTag: { ...data.artTag, caption: v.caption },
                        labels: {
                          ...data.labels,
                          book: v.book,
                          explore: v.explore,
                        },
                      })
                    }
                  />
                  <button
                    className="button outline small"
                    onClick={() => navigate('settings', 'chakra')}
                  >
                    Edit 3D model & effects
                  </button>
                </details>
              )}
              {s.id === 'contact' && (
                <button
                  className="button outline small"
                  onClick={() => navigate('settings', 'contact')}
                >
                  Edit contact details & form fields
                </button>
              )}
              {s.id === 'about' && (
                <button
                  className="button outline small"
                  onClick={() => navigate('settings', 'brand')}
                >
                  Edit founder name & business details
                </button>
              )}
              {s.id.startsWith('custom-') && (
                <div className="section-toolbar">
                  <button
                    className="button outline small"
                    onClick={() => {
                      onChange({
                        ...data,
                        sections: [
                          ...data.sections,
                          {
                            ...structuredClone(s),
                            id: 'custom-' + crypto.randomUUID(),
                            title: s.title + ' (copy)',
                          },
                        ],
                      });
                      onSelect(data.sections.length);
                    }}
                  >
                    <Copy size={15} />
                    Duplicate section
                  </button>
                  <button
                    className="button outline small"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Remove this custom section from the draft?',
                        )
                      ) {
                        onChange({
                          ...data,
                          sections: data.sections.filter(
                            (_, i) => i !== selected,
                          ),
                        });
                        onSelect(-1);
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    Delete section
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
