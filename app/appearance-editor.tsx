import type { ComponentType } from 'react';
import Chakra from './chakra';
import type { Content } from './page';
export function AppearanceEditor({
  data,
  onChange,
  modelOnly = false,
  Editor,
}: {
  data: Content;
  onChange: (v: Content) => void;
  modelOnly?: boolean;
  Editor: ComponentType<any>;
}) {
  const cfg = data.chakra;
  const patch = (v: Partial<typeof cfg>) =>
    onChange({ ...data, chakra: { ...cfg, ...v } });
  const hero = data.sections.find((s) => s.id === 'hero');
  return (
    <div className="editor-panel appearance-editor">
      <h2>
        {modelOnly ? 'Hero visual & 3D effects' : 'Website colours & design'}
      </h2>
      <p>
        Changes preview here immediately. Save a draft to preview the website,
        then publish when ready.
      </p>
      {!modelOnly && (
        <>
          <div className="palette-presets">
            {[
              ['Midnight gold', '#061426', '#d6a442', '#f1d58e'],
              ['Sky & orange', '#071521', '#f97316', '#38bdf8'],
              ['Emerald gold', '#081c1a', '#d7ad50', '#7edac6'],
            ].map(([name, background, accent, sky]) => (
              <button
                className="button outline small"
                key={name}
                onClick={() =>
                  onChange({
                    ...data,
                    theme: { ...data.theme, background, accent, sky },
                  })
                }
              >
                {name}
              </button>
            ))}
          </div>
          <Editor
            value={{ theme: data.theme, labels: data.labels }}
            onChange={(v: any) => onChange({ ...data, ...v })}
          />
        </>
      )}
      <div className="appearance-grid">
        <div>
          <h3>Hero visual</h3>
          <label>
            Visual style
            <select
              aria-label="Visual style"
              value={cfg.mode}
              onChange={(e) => patch({ mode: e.target.value })}
            >
              <option value="zodiac">3D zodiac chakra</option>
              <option value="orrery">3D planetary orbits</option>
              <option value="image">Custom image</option>
              <option value="none">No visual</option>
            </select>
          </label>
          {['zodiac', 'orrery'].includes(cfg.mode) && (
            <>
              {(
                [
                  ['faceOn', 'Front-facing zodiac wheel'],
                  ['autoRotate', 'Animate on page load'],
                  ['interactive', 'Allow visitors to rotate the model'],
                  ['floating', 'Floating motion'],
                  ['glow', 'Background glow'],
                  ['useThemeColours', 'Use website colours'],
                ] as const
              ).map(([key, title]) => (
                <label className="appearance-toggle" key={key}>
                  <input
                    type="checkbox"
                    checked={cfg[key]}
                    onChange={(e) => patch({ [key]: e.target.checked })}
                  />
                  {title}
                </label>
              ))}
              <label>
                Rotation direction
                <select
                  aria-label="Rotation direction"
                  value={cfg.direction}
                  onChange={(e) => patch({ direction: e.target.value })}
                >
                  <option value="clockwise">Clockwise</option>
                  <option value="counterclockwise">Counterclockwise</option>
                </select>
              </label>
              {(
                [
                  ['speed', 'Rotation speed', 0, 3, 0.1],
                  ['scale', 'Model size', 0.6, 1.25, 0.05],
                  ['tilt', 'Model tilt', -30, 30, 1],
                ] as const
              ).map(([key, title, min, max, step]) => (
                <label key={key}>
                  {title}: {cfg[key]}
                  <input
                    aria-label={title}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={cfg[key]}
                    onChange={(e) => patch({ [key]: Number(e.target.value) })}
                  />
                </label>
              ))}
              {!cfg.useThemeColours &&
                (['accent', 'highlight'] as const).map((key) => (
                  <label key={key}>
                    Model {key} colour
                    <input
                      aria-label={'Model ' + key + ' colour'}
                      type="color"
                      value={cfg[key]}
                      onChange={(e) => patch({ [key]: e.target.value })}
                    />
                  </label>
                ))}
              <label>
                Chakra surface colour
                <input
                  aria-label="Chakra surface colour"
                  type="color"
                  value={cfg.surface}
                  onChange={(e) => patch({ surface: e.target.value })}
                />
              </label>
              <p>
                Visitors who prefer reduced motion will see a paused model. They
                can start it using the play button.
              </p>
            </>
          )}
          {cfg.mode === 'image' && hero && (
            <Editor
              value={{ image: hero.image, imageAlt: hero.imageAlt }}
              onChange={(v: any) =>
                onChange({
                  ...data,
                  sections: data.sections.map((s) =>
                    s.id === 'hero' ? { ...s, ...v } : s,
                  ),
                })
              }
            />
          )}
          <Editor
            value={{ caption: data.artTag.caption }}
            onChange={(v: any) =>
              onChange({
                ...data,
                artTag: { ...data.artTag, caption: v.caption },
              })
            }
          />
        </div>
        <div
          className="appearance-preview"
          style={{ background: data.theme.background }}
        >
          <span style={{ color: data.theme.sky }}>HERO VISUAL PREVIEW</span>
          {cfg.mode === 'none' ? (
            <p style={{ color: '#fff' }}>
              Your hero will show text and buttons only.
            </p>
          ) : cfg.mode === 'image' ? (
            <img
              src={hero?.image || data.brand.logo}
              alt={hero?.imageAlt || 'Hero preview'}
            />
          ) : (
            <Chakra
              settings={cfg}
              accent={cfg.useThemeColours ? data.theme.accent : cfg.accent}
              highlight={cfg.useThemeColours ? data.theme.sky : cfg.highlight}
              fallback={data.brand.logo}
            />
          )}
          <p style={{ color: data.theme.sky }}>{data.artTag.caption}</p>
        </div>
      </div>
    </div>
  );
}
