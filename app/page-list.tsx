import { useState } from 'react';
import type { Content, CMSPage } from './page';
export function PageList({
  data,
  onChange,
  onEdit,
  navigate,
}: {
  data: Content;
  onChange: (c: Content) => void;
  onEdit: (id: string) => void;
  navigate: (view: string, group?: string) => void;
}) {
  const [filter, setFilter] = useState('all'),
    [search, setSearch] = useState(''),
    [sort, setSort] = useState('title'),
    [checked, setChecked] = useState<string[]>([]),
    [bulk, setBulk] = useState(''),
    [quick, setQuick] = useState<CMSPage | null>(null),
    [notice, setNotice] = useState('');
  const active = data.pages.filter((p) => !p.trashedAt);
  const rows = data.pages
    .filter(
      (p) =>
        (filter === 'trash'
          ? !!p.trashedAt
          : !p.trashedAt &&
            (filter === 'all' ||
              (filter === 'public' ? p.published : !p.published))) &&
        (p.title + ' ' + p.slug).toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : (b.updatedAt || '').localeCompare(a.updatedAt || ''),
    );
  const builtin = filter === 'all' || filter === 'public';
  const system = [
    {
      id: 'home',
      title: 'Home',
      path: '/',
      view: 'content',
      desc: 'Front page',
    },
    {
      id: 'blog',
      title: 'Blog',
      path: '/blog',
      view: 'posts',
      desc: 'Posts page',
    },
  ].filter(
    (p) =>
      builtin &&
      (p.title + ' ' + p.path).toLowerCase().includes(search.toLowerCase()),
  );
  function act(action: string, ids: string[]) {
    const eligible = data.pages.filter(
      (p) =>
        ids.includes(p.id) &&
        (action === 'trash' ? !p.trashedAt : !!p.trashedAt),
    );
    if (!eligible.length) return;
    if (
      action === 'delete' &&
      !window.confirm(
        'Permanently delete ' +
          eligible.length +
          ' page(s) from the draft? This cannot be undone. Publish changes to apply the deletion to the website.',
      )
    )
      return;
    const targets = new Set(eligible.map((p) => p.id));
    const paths = new Set(eligible.map((p) => '/pages/' + p.slug));
    onChange({
      ...data,
      pages:
        action === 'delete'
          ? data.pages.filter((p) => !targets.has(p.id))
          : data.pages.map((p) => {
              if (!targets.has(p.id)) return p;
              if (action === 'trash')
                return {
                  ...p,
                  published: false,
                  trashedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
              const { trashedAt: _trashed, ...rest } = p;
              return {
                ...rest,
                published: false,
                updatedAt: new Date().toISOString(),
              };
            }),
      ...(action === 'delete'
        ? {
            navigation: data.navigation.filter((n) => !paths.has(n.target)),
            footer: {
              ...data.footer,
              columns: data.footer.columns.map((col) => ({
                ...col,
                links: col.links.filter((l) => !paths.has(l.href)),
              })),
            },
          }
        : {}),
    });
    setChecked([]);
    setQuick(null);
    setNotice(
      action === 'trash'
        ? 'Moved to Trash. Save a draft or publish to keep this change.'
        : action === 'restore'
          ? 'Restored as a draft. Edit the page and enable publication when ready.'
          : 'Permanently removed from this draft. Save or publish to keep this change.',
    );
  }
  function duplicate(p: CMSPage) {
    const id = crypto.randomUUID();
    const copy = {
      ...structuredClone(p),
      id,
      title: p.title + ' (copy)',
      slug: p.slug.slice(0, 80) + '-copy-' + id.slice(0, 8),
      published: false,
      updatedAt: new Date().toISOString(),
    };
    onChange({ ...data, pages: [...data.pages, copy] });
    onEdit(id);
  }
  function saveQuick() {
    if (!quick) return;
    if (
      !quick.title.trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(quick.slug) ||
      data.pages.some((p) => p.id !== quick.id && p.slug === quick.slug)
    ) {
      setNotice('Enter a title and a unique URL slug.');
      return;
    }
    const previous = data.pages.find((p) => p.id === quick.id)!;
    onChange({
      ...data,
      pages: data.pages.map((p) =>
        p.id === quick.id
          ? { ...quick, updatedAt: new Date().toISOString() }
          : p,
      ),
      navigation: data.navigation.map((n) =>
        n.target === '/pages/' + previous.slug
          ? { ...n, target: '/pages/' + quick.slug }
          : n,
      ),
      footer: {
        ...data.footer,
        columns: data.footer.columns.map((col) => ({
          ...col,
          links: col.links.map((l) =>
            l.href === '/pages/' + previous.slug
              ? { ...l, href: '/pages/' + quick.slug }
              : l,
          ),
        })),
      },
    });
    setQuick(null);
    setNotice('Quick edit applied to your draft. Save or publish to keep it.');
  }
  return (
    <div className="wp-pages">
      <p className="cms-hint">
        Home, Blog and all pages created here appear below. Public and Draft
        show your current settings; Publish changes applies them to the website.
      </p>
      <div className="wp-filters" aria-label="Page status filters">
        {[
          ['all', 'All', active.length + 2],
          ['public', 'Public', active.filter((p) => p.published).length + 2],
          ['draft', 'Drafts', active.filter((p) => !p.published).length],
          ['trash', 'Trash', data.pages.filter((p) => p.trashedAt).length],
        ].map(([key, title, count]) => (
          <button
            key={key}
            aria-pressed={filter === key}
            onClick={() => {
              setFilter(String(key));
              setBulk('');
              setChecked([]);
              setQuick(null);
            }}
          >
            {title} <span>({count})</span>
          </button>
        ))}
      </div>
      {notice && (
        <p className="wp-notice" role="status">
          {notice}
        </p>
      )}
      <div className="wp-tools">
        <div>
          <select
            aria-label="Bulk action"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          >
            <option value="">Bulk actions</option>
            {filter === 'trash' ? (
              <>
                <option value="restore">Restore</option>
                <option value="delete">Delete permanently</option>
              </>
            ) : (
              <option value="trash">Move to Trash</option>
            )}
          </select>
          <button
            className="button outline small"
            disabled={!bulk || !checked.length}
            onClick={() => act(bulk, checked)}
          >
            Apply
          </button>
        </div>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="title">Title A–Z</option>
            <option value="date">Recently edited</option>
          </select>
        </label>
        <label>
          Search pages
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or URL"
          />
        </label>
      </div>
      <div className="wp-table-scroll">
        <table className="wp-page-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all listed pages"
                  checked={
                    rows.length > 0 && rows.every((p) => checked.includes(p.id))
                  }
                  onChange={(e) =>
                    setChecked(e.target.checked ? rows.map((p) => p.id) : [])
                  }
                />
              </th>
              <th>Title</th>
              <th>Status</th>
              <th>Sections</th>
              <th>Last edited</th>
            </tr>
          </thead>
          <tbody>
            {system.map((p) => (
              <tr key={p.id}>
                <td aria-label="Website page" />
                <td>
                  <button
                    className="wp-page-title"
                    onClick={() => navigate(p.view)}
                  >
                    {p.title}
                  </button>
                  <small>
                    {p.path} · {p.desc}
                  </small>
                  <div className="wp-row-actions">
                    <button onClick={() => navigate(p.view)}>Edit</button>
                    <a href={p.path} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </div>
                </td>
                <td>
                  <span className="wp-badge">Website page</span>
                </td>
                <td>
                  {p.id === 'home' ? data.sections.length : 'Latest posts'}
                </td>
                <td>—</td>
              </tr>
            ))}
            {rows.map((p) => (
              <tr
                key={p.id}
                className={checked.includes(p.id) ? 'row-selected' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    aria-label={'Select ' + p.title}
                    checked={checked.includes(p.id)}
                    onChange={(e) =>
                      setChecked(
                        e.target.checked
                          ? [...checked, p.id]
                          : checked.filter((id) => id !== p.id),
                      )
                    }
                  />
                </td>
                <td>
                  {quick?.id === p.id ? (
                    <div className="wp-quick">
                      <strong>Quick Edit</strong>
                      <label>
                        Page title
                        <input
                          value={quick.title}
                          onChange={(e) =>
                            setQuick({ ...quick, title: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        URL slug
                        <input
                          value={quick.slug}
                          onChange={(e) =>
                            setQuick({
                              ...quick,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ''),
                            })
                          }
                        />
                      </label>
                      <label>
                        Status
                        <select
                          value={quick.published ? 'public' : 'draft'}
                          onChange={(e) =>
                            setQuick({
                              ...quick,
                              published: e.target.value === 'public',
                            })
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="public">Public on next publish</option>
                        </select>
                      </label>
                      <button className="button small" onClick={saveQuick}>
                        Update draft
                      </button>
                      <button
                        className="button outline small"
                        onClick={() => setQuick(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="wp-page-title"
                        disabled={!!p.trashedAt}
                        onClick={() => onEdit(p.id)}
                      >
                        {p.title}
                      </button>
                      <small>/pages/{p.slug}</small>
                      <div className="wp-row-actions">
                        {p.trashedAt ? (
                          <>
                            <button onClick={() => act('restore', [p.id])}>
                              Restore
                            </button>
                            <button
                              className="wp-danger"
                              onClick={() => act('delete', [p.id])}
                            >
                              Delete permanently
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onEdit(p.id)}>Edit</button>
                            <button
                              onClick={() => setQuick(structuredClone(p))}
                            >
                              Quick Edit
                            </button>
                            <button
                              disabled={data.pages.length >= 100}
                              onClick={() => duplicate(p)}
                            >
                              Duplicate
                            </button>
                            <button
                              className="wp-danger"
                              onClick={() => act('trash', [p.id])}
                            >
                              Trash
                            </button>
                            <a
                              href={'/pages/' + p.slug + '?preview=1'}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview saved
                            </a>
                            {p.published && (
                              <a
                                href={'/pages/' + p.slug}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </td>
                <td>
                  <span className="wp-badge">
                    {p.trashedAt ? 'Trash' : p.published ? 'Public' : 'Draft'}
                  </span>
                </td>
                <td>{p.sections.length}</td>
                <td>
                  {p.updatedAt
                    ? new Date(p.updatedAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
            {!rows.length && !system.length && (
              <tr>
                <td colSpan={5}>No pages found in this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="cms-hint">
        {rows.length + system.length} pages shown. Trash keeps page content so
        you can restore it. Restored pages return as drafts.
      </p>
    </div>
  );
}
