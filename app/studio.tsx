'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  MoveUp,
  MoveDown,
  Plus,
  Trash2,
  LogOut,
  Save,
  Eye,
  ImagePlus,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import initial from '@/content/default.json';
import { api, type Content } from './page';
export default function Admin() {
  const [authorized, setAuthorized] = useState(false),
    [checking, setChecking] = useState(true),
    [data, setData] = useState<Content>(initial),
    [section, setSection] = useState(-1),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    [enquiries, setEnquiries] = useState<any[]>([]),
    [tab, setTab] = useState('content'),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    api('admin/content')
      .then((x) => {
        setAuthorized(true);
        setData(x.draft);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty]);
  function update(next: Content) {
    setData(next);
    setDirty(true);
    setStatus('');
  }
  async function login(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const x = await api('admin/content');
      setData(x.draft);
      setAuthorized(true);
      setStatus('');
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(publish = false) {
    setBusy(true);
    setStatus('');
    try {
      await api('admin/content', {
        method: 'PUT',
        body: JSON.stringify({ content: data, publish }),
      });
      setDirty(false);
      setStatus(
        publish
          ? 'Homepage published successfully.'
          : 'Draft saved. Your live homepage has not changed.',
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return <div className="login-shell">Loading your workspace…</div>;
  if (!authorized)
    return (
      <main className="login-shell">
        <form className="login-card" onSubmit={login}>
          <img src={initial.brand.logo} alt="Business Destiny" />
          <div className="eyebrow">BUSINESS DESTINY / STUDIO</div>
          <h1>Welcome back.</h1>
          <p>Your website, in your hands.</p>
          <label>
            Username
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={18} />
          </button>
          {status && (
            <p role="alert" className="error">
              {status}
            </p>
          )}
          <a href="/">← Back to website</a>
        </form>
      </main>
    );
  return (
    <main className="admin">
      <header className="admin-header">
        <a className="brand" href="/">
          <img src={data.brand.logo} alt="" />
          <span>
            Business Destiny<small>WEBSITE STUDIO</small>
          </span>
        </a>
        <div className="admin-actions">
          <a
            className="button outline small"
            href="/?preview=1"
            target="_blank"
          >
            <Eye size={16} />
            Preview saved draft
          </a>
          <button
            disabled={busy}
            className="button outline small"
            onClick={() => save()}
          >
            <Save size={16} />
            Save draft
          </button>
          <button
            disabled={busy}
            className="button small"
            onClick={() => save(true)}
          >
            Publish changes
            <ArrowUpRight size={16} />
          </button>
          <button
            aria-label="Sign out"
            className="iconbutton"
            onClick={async () => {
              try {
                await api('logout', { method: 'POST' });
                setAuthorized(false);
              } catch (e) {
                setStatus((e as Error).message);
              }
            }}
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>
      <div className="admin-intro">
        <div className="eyebrow">YOUR WEBSITE, YOUR WAY</div>
        <h1>Make it yours.</h1>
        <p>
          Edit text, upload images, rearrange sections, and publish when you’re
          ready.
        </p>
        <p className="admin-status" role="status">
          {status || (dirty ? 'Unsaved changes' : 'All changes saved')}
        </p>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(String(v));
          if (v === 'enquiries')
            api('admin/enquiries')
              .then(setEnquiries)
              .catch((e) => setStatus(e.message));
        }}
      >
        <TabsList className="admin-tabs">
          <TabsTrigger value="content">Homepage editor</TabsTrigger>
          <TabsTrigger value="enquiries">Consultation enquiries</TabsTrigger>
          <TabsTrigger value="security">Account settings</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <div className="editor-grid">
            <aside className="editor-sidebar">
              <button
                className={section === -1 ? 'selected' : ''}
                onClick={() => setSection(-1)}
              >
                Brand, colours & settings
              </button>
              <div className="eyebrow">HOMEPAGE SECTIONS</div>
              {data.sections.map((s, i) => (
                <div className="section-row" key={s.id}>
                  <button
                    className={section === i ? 'selected' : ''}
                    onClick={() => setSection(i)}
                  >
                    {i + 1}. {s.id}
                    {!s.visible && ' (hidden)'}
                  </button>
                  <button
                    className="iconbutton"
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => {
                      const arr = [...data.sections];
                      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                      update({ ...data, sections: arr });
                      setSection(i - 1);
                    }}
                  >
                    <MoveUp size={14} />
                  </button>
                  <button
                    className="iconbutton"
                    title="Move down"
                    disabled={i === data.sections.length - 1}
                    onClick={() => {
                      const arr = [...data.sections];
                      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                      update({ ...data, sections: arr });
                      setSection(i + 1);
                    }}
                  >
                    <MoveDown size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  update({
                    ...data,
                    sections: [
                      ...data.sections,
                      {
                        id: 'custom-' + Date.now(),
                        visible: true,
                        eyebrow: 'YOUR SECTION',
                        title: 'New section',
                        highlight: '',
                        description: 'Write an introduction.',
                        body: '',
                        image: '',
                        imageAlt: '',
                        items: [],
                      },
                    ],
                  });
                  setSection(data.sections.length);
                }}
              >
                <Plus size={15} />
                Add custom section
              </button>
            </aside>
            <div className="editor-panel">
              <h2>
                {section < 0
                  ? 'Brand & website settings'
                  : data.sections[section]?.id + ' section'}
              </h2>
              <p>
                Save a draft to preview. Publish changes to update the homepage.
              </p>
              {section < 0 ? (
                <ObjectEditor
                  value={Object.fromEntries(
                    Object.entries(data).filter(([k]) => k !== 'sections'),
                  )}
                  onChange={(v) =>
                    update({ ...v, sections: data.sections } as Content)
                  }
                />
              ) : (
                <ObjectEditor
                  value={data.sections[section]}
                  onChange={(v) => {
                    const arr = [...data.sections];
                    arr[section] = v;
                    update({ ...data, sections: arr });
                  }}
                />
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="enquiries">
          <div className="editor-panel">
            <h2>Consultation enquiries</h2>
            <p>
              Contact the client to confirm availability. No payment is
              collected.
            </p>
            {!enquiries.length ? (
              <p>No enquiries yet.</p>
            ) : (
              enquiries.map((e) => (
                <article className="enquiry-record" key={e.id}>
                  <div>
                    <h3>{e.data.name}</h3>
                    <small>{new Date(e.created).toLocaleString()}</small>
                  </div>
                  <p>{e.data.service}</p>
                  <p>{e.data.question}</p>
                  <dl>
                    {Object.entries(e.data)
                      .filter(
                        ([k]) =>
                          !['question', 'consent', 'website'].includes(k),
                      )
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{String(v)}</dd>
                        </div>
                      ))}
                  </dl>
                </article>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="security">
          <PasswordForm setStatus={setStatus} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
function PasswordForm({ setStatus }: { setStatus: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="editor-panel security-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        try {
          await api('admin/password', {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          setStatus('Password changed. Other sessions have been signed out.');
          form.reset();
        } catch (e) {
          setStatus((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Change your password</h2>
      <label>
        Current password
        <input
          type="password"
          name="current"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        New password (at least 12 characters)
        <input
          type="password"
          name="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </label>
      <button className="button" disabled={busy}>
        Update password
      </button>
    </form>
  );
}
function ObjectEditor({
  value,
  onChange,
  path = '',
}: {
  value: any;
  onChange: (v: any) => void;
  path?: string;
}) {
  const [uploadError, setUploadError] = useState('');
  if (Array.isArray(value))
    return (
      <div className="array-editor">
        {value.map((item, i) => (
          <div className="array-item" key={i}>
            <div className="array-tools">
              <span>Item {i + 1}</span>
              <button
                aria-label="Move item up"
                disabled={i === 0}
                onClick={() => {
                  const a = [...value];
                  [a[i], a[i - 1]] = [a[i - 1], a[i]];
                  onChange(a);
                }}
              >
                <MoveUp size={15} />
              </button>
              <button
                aria-label="Remove item"
                onClick={() =>
                  onChange(value.filter((_: any, j: number) => i !== j))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
            <ObjectEditor
              value={item}
              onChange={(v) =>
                onChange(value.map((x: any, j: number) => (i === j ? v : x)))
              }
              path={path}
            />
          </div>
        ))}
        <button
          className="button outline small"
          onClick={() =>
            onChange([
              ...value,
              value[0]
                ? JSON.parse(JSON.stringify(value[0]))
                : { title: 'New item', description: 'Describe this item.' },
            ])
          }
        >
          <Plus size={16} />
          Add item
        </button>
      </div>
    );
  if (value && typeof value === 'object')
    return (
      <div className="object-editor">
        {Object.entries(value)
          .filter(([k]) => k !== 'id' && !(path === 'fields' && k === 'name'))
          .map(([key, val]) =>
            typeof val === 'object' && val !== null ? (
              <details
                className="editor-group"
                key={key}
                open={key === 'items'}
              >
                <summary>{label(key)}</summary>
                <ObjectEditor
                  value={val}
                  onChange={(v) => onChange({ ...value, [key]: v })}
                  path={key}
                />
              </details>
            ) : (
              <div key={key} className="editor-field">
                {typeof val === 'boolean' ? (
                  <label className="checkbox-label">
                    <Checkbox
                      checked={val}
                      onCheckedChange={(v) => onChange({ ...value, [key]: v })}
                    />
                    {label(key)}
                  </label>
                ) : (
                  <label>
                    {label(key)}
                    {['accent', 'sky', 'background'].includes(key) ? (
                      <input
                        type="color"
                        value={String(val)}
                        onChange={(e) =>
                          onChange({ ...value, [key]: e.target.value })
                        }
                      />
                    ) : typeof val === 'number' ? (
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={val}
                        onChange={(e) =>
                          onChange({ ...value, [key]: Number(e.target.value) })
                        }
                      />
                    ) : (
                      <textarea
                        rows={String(val).length > 100 ? 3 : 1}
                        value={String(val)}
                        onChange={(e) =>
                          onChange({ ...value, [key]: e.target.value })
                        }
                      />
                    )}
                  </label>
                )}
                {['image', 'logo'].includes(key) && (
                  <div className="upload-row">
                    {Boolean(val) && (
                      <img src={String(val)} alt="Current upload" />
                    )}
                    <label className="upload-button">
                      <ImagePlus size={16} />
                      Upload image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadError('Uploading…');
                          try {
                            if (file.size > 5 * 1024 * 1024)
                              throw Error('Please choose an image under 5 MB.');
                            const r = await fetch('/api/admin/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': file.type },
                              body: file,
                            });
                            const v: any = await r.json();
                            if (!r.ok) throw Error(v.error);
                            onChange({ ...value, [key]: v.url });
                            setUploadError(
                              'Image uploaded. Save your changes.',
                            );
                          } catch (err) {
                            setUploadError((err as Error).message);
                          }
                        }}
                      />
                    </label>
                    <small role="status">{uploadError}</small>
                  </div>
                )}
                {key === 'layout' && (
                  <small>Use “standard” or “compact”.</small>
                )}
              </div>
            ),
          )}
      </div>
    );
  return (
    <input value={String(value)} onChange={(e) => onChange(e.target.value)} />
  );
}
function label(s: string) {
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, (v) => v.toUpperCase());
}
