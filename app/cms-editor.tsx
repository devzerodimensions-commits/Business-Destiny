import { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ArrowUpRight,
  ImagePlus,
} from 'lucide-react';
import type { Content, CMSPage, PageSection } from './page';
type EditorProps = {
  data: Content;
  onChange: (v: Content) => void;
  Editor: React.ComponentType<{
    value: any;
    onChange: (v: any) => void;
    path?: string;
  }>;
};
export function PagesEditor({ data, onChange, Editor }: EditorProps) {
  const [selected, setSelected] = useState('');
  const page = data.pages.find((p) => p.id === selected);
  const update = (next: CMSPage) =>
    onChange({
      ...data,
      pages: data.pages.map((p) => (p.id === next.id ? next : p)),
      navigation: data.navigation.map((n) =>
        page && n.target === '/pages/' + page.slug
          ? { ...n, target: '/pages/' + next.slug }
          : n,
      ),
    });
  return (
    <div className="editor-panel">
      <div className="cms-toolbar">
        <div>
          <h2>Pages</h2>
          <p>
            Create a page, add sections, then save or publish from the top bar.
          </p>
        </div>
        <button
          className="button small"
          onClick={() => {
            const id = crypto.randomUUID();
            onChange({
              ...data,
              pages: [
                ...data.pages,
                {
                  id,
                  title: 'New page',
                  slug: 'new-page-' + id.slice(0, 8),
                  published: false,
                  sections: [],
                },
              ],
            });
            setSelected(id);
          }}
        >
          <Plus size={16} />
          Add page
        </button>
      </div>
      <div className="cms-list">
        {data.pages.map((p) => (
          <button
            className={p.id === selected ? 'selected' : ''}
            key={p.id}
            onClick={() => setSelected(p.id)}
          >
            <strong>{p.title}</strong>
            <span>
              /pages/{p.slug} ·{' '}
              {p.published ? 'Ready to publish' : 'Draft only'}
            </span>
          </button>
        ))}
        {!data.pages.length && (
          <p>No extra pages yet. Add your first page to get started.</p>
        )}
      </div>
      {page && (
        <div className="cms-document">
          <ObjectFields page={page} onChange={update} />
          <div className="cms-toolbar">
            <button
              className="button outline small"
              disabled={
                data.navigation.length >= 10 ||
                data.navigation.some((n) => n.target === '/pages/' + page.slug)
              }
              onClick={() =>
                onChange({
                  ...data,
                  navigation: [
                    ...data.navigation,
                    { label: page.title, target: '/pages/' + page.slug },
                  ],
                })
              }
            >
              Add to header menu
            </button>
            <a
              className="textlink"
              href={'/pages/' + page.slug + '?preview=1'}
              target="_blank"
            >
              Preview saved page
              <ArrowUpRight size={16} />
            </a>
            <button
              className="button outline small"
              onClick={() => {
                if (
                  confirm(
                    'Remove this page from the draft? Publish changes to remove it from the live website.',
                  )
                ) {
                  onChange({
                    ...data,
                    pages: data.pages.filter((p) => p.id !== page.id),
                    navigation: data.navigation.filter(
                      (n) => n.target !== '/pages/' + page.slug,
                    ),
                  });
                  setSelected('');
                }
              }}
            >
              <Trash2 size={16} />
              Delete page
            </button>
          </div>
          <h3>Page sections</h3>
          <div className="section-add-buttons">
            {(['text', 'image', 'cards', 'cta'] as const).map((type) => (
              <button
                className="button outline small"
                key={type}
                onClick={() =>
                  update({
                    ...page,
                    sections: [
                      ...page.sections,
                      {
                        id: crypto.randomUUID(),
                        type,
                        visible: true,
                        title: 'New ' + type + ' section',
                        description: '',
                        body: '',
                        image: '',
                        imageAlt: '',
                        buttonLabel: type === 'cta' ? 'Contact us' : '',
                        buttonUrl: type === 'cta' ? '/#contact' : '',
                        items: [],
                      },
                    ],
                  })
                }
              >
                <Plus size={14} />
                {type === 'cta'
                  ? 'Call to action'
                  : type === 'cards'
                    ? 'Cards'
                    : type === 'image'
                      ? 'Image & text'
                      : 'Text'}
              </button>
            ))}
          </div>
          {page.sections.map((section, i) => (
            <div className="cms-section" key={section.id}>
              <div className="array-tools">
                <span>
                  {i + 1}. {section.type}
                </span>
                <button
                  aria-label="Move section up"
                  disabled={i === 0}
                  onClick={() => {
                    const sections = [...page.sections];
                    [sections[i - 1], sections[i]] = [
                      sections[i],
                      sections[i - 1],
                    ];
                    update({ ...page, sections });
                  }}
                >
                  <MoveUp size={16} />
                </button>
                <button
                  aria-label="Move section down"
                  disabled={i === page.sections.length - 1}
                  onClick={() => {
                    const sections = [...page.sections];
                    [sections[i + 1], sections[i]] = [
                      sections[i],
                      sections[i + 1],
                    ];
                    update({ ...page, sections });
                  }}
                >
                  <MoveDown size={16} />
                </button>
                <button
                  aria-label="Delete section"
                  onClick={() => {
                    if (confirm('Remove this section?'))
                      update({
                        ...page,
                        sections: page.sections.filter(
                          (s) => s.id !== section.id,
                        ),
                      });
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <Editor
                value={Object.fromEntries(
                  Object.entries(section).filter(
                    ([k]) =>
                      k !== 'type' &&
                      (section.type === 'cards' || k !== 'items'),
                  ),
                )}
                onChange={(v) =>
                  update({
                    ...page,
                    sections: page.sections.map((s) =>
                      s.id === section.id ? ({ ...s, ...v } as PageSection) : s,
                    ),
                  })
                }
              />
            </div>
          ))}
          <p className="cms-hint">
            Header and footer are shared with your website. Add this page to
            Header menu using the target /pages/{page.slug}.
          </p>
        </div>
      )}
    </div>
  );
}
function ObjectFields({
  page,
  onChange,
}: {
  page: CMSPage;
  onChange: (p: CMSPage) => void;
}) {
  return (
    <div className="cms-fields">
      <label>
        Page title
        <input
          value={page.title}
          onChange={(e) => onChange({ ...page, title: e.target.value })}
        />
      </label>
      <label>
        URL slug
        <input
          value={page.slug}
          onChange={(e) =>
            onChange({
              ...page,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            })
          }
        />
      </label>
      <label className="cms-check">
        <input
          type="checkbox"
          checked={page.published}
          onChange={(e) => onChange({ ...page, published: e.target.checked })}
        />
        Include page when publishing changes
      </label>
    </div>
  );
}
export function PostsEditor({ data, onChange, Editor }: EditorProps) {
  const [selected, setSelected] = useState('');
  const post = data.posts.find((p) => p.id === selected);
  return (
    <div className="editor-panel">
      <div className="cms-toolbar">
        <div>
          <h2>Posts / Blog</h2>
          <p>
            The homepage shows the three newest published posts. Manage all
            articles here.
          </p>
        </div>
        <button
          className="button small"
          onClick={() => {
            const id = crypto.randomUUID();
            onChange({
              ...data,
              posts: [
                ...data.posts,
                {
                  id,
                  slug: 'new-article-' + id.slice(0, 8),
                  title: 'New article',
                  excerpt: '',
                  body: '',
                  category: 'Business insights',
                  author: data.brand.name,
                  date: new Date().toISOString().slice(0, 10),
                  image: '',
                  imageAlt: '',
                  published: false,
                },
              ],
            });
            setSelected(id);
          }}
        >
          <Plus size={16} />
          Add post
        </button>
      </div>
      <details className="editor-group">
        <summary>Homepage blog settings</summary>
        <Editor
          value={data.blog}
          onChange={(v) => onChange({ ...data, blog: v })}
        />
      </details>
      <div className="cms-list">
        {data.posts.map((p) => (
          <button
            key={p.id}
            className={selected === p.id ? 'selected' : ''}
            onClick={() => setSelected(p.id)}
          >
            <strong>{p.title}</strong>
            <span>
              {p.date} · {p.published ? 'Ready to publish' : 'Draft only'}
            </span>
          </button>
        ))}
      </div>
      {post && (
        <div className="cms-document">
          <div className="cms-toolbar">
            <a
              className="textlink"
              target="_blank"
              href={'/blog/' + post.slug + '?preview=1'}
            >
              Preview saved post
              <ArrowUpRight size={16} />
            </a>
            <button
              className="button outline small"
              onClick={() => {
                if (
                  confirm(
                    'Delete this post from the draft? Publish changes to remove it from the website.',
                  )
                ) {
                  onChange({
                    ...data,
                    posts: data.posts.filter((p) => p.id !== post.id),
                  });
                  setSelected('');
                }
              }}
            >
              <Trash2 size={16} />
              Delete post
            </button>
          </div>
          <p className="cms-hint">
            “Published” includes this article the next time you click Publish
            changes. Use a unique URL slug with lowercase letters and hyphens.
          </p>
          <Editor
            value={post}
            onChange={(v) =>
              onChange({
                ...data,
                posts: data.posts.map((p) => (p.id === post.id ? v : p)),
              })
            }
          />
        </div>
      )}
    </div>
  );
}
export function MediaLibrary({
  data,
  onChange,
}: Pick<EditorProps, 'data' | 'onChange'>) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="media-library">
      <div className="cms-toolbar">
        <div>
          <h3>Media library</h3>
          <p>
            Upload reusable images. Copy an image URL into any page, post or
            section image field.
          </p>
        </div>
        <label className="upload-button">
          <ImagePlus size={17} />
          {busy ? 'Uploading…' : 'Upload to library'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                if (file.size > 5242880)
                  throw Error('Choose an image under 5 MB.');
                const r = await fetch('/api/admin/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': file.type },
                  body: file,
                });
                const v = (await r.json()) as { url: string; error?: string };
                if (!r.ok) throw Error(v.error);
                onChange({
                  ...data,
                  media: [
                    ...data.media,
                    { id: crypto.randomUUID(), name: file.name, image: v.url },
                  ],
                });
                setStatus(
                  'Uploaded. Save your draft to keep this library entry.',
                );
              } catch (e) {
                setStatus((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      <p role="status">{status}</p>
      <div className="media-grid">
        {data.media.map((m) => (
          <article className="media-card" key={m.id}>
            <img className="library-image" src={m.image} alt={m.name} />
            <h3>{m.name}</h3>
            <input
              aria-label={'Image URL for ' + m.name}
              readOnly
              value={m.image}
            />
            <button
              className="button outline small"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(m.image);
                  setStatus('Image URL copied.');
                } catch {
                  setStatus('Select the image URL field and copy it.');
                }
              }}
            >
              Copy URL
            </button>
            <button
              className="button outline small"
              onClick={() => {
                onChange({
                  ...data,
                  media: data.media.filter((x) => x.id !== m.id),
                });
                setStatus(
                  'Removed from the library draft. Existing uses of this image still work.',
                );
              }}
            >
              Remove from library
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
