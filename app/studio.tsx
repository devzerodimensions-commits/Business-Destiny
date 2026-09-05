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
  LayoutDashboard,
  Layers,
  Menu,
  Building2,
  Palette,
  MessageSquare,
  ShieldCheck,
  BriefcaseBusiness,
  BadgeIndianRupee,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import initial from '@/content/default.json';
import { api, type Content } from './page';
import { PagesEditor, PostsEditor, MediaLibrary } from './cms-editor';
export default function Admin() {
  const [authorized, setAuthorized] = useState(false),
    [checking, setChecking] = useState(true),
    [data, setData] = useState<Content>(initial),
    [section, setSection] = useState(-1),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    [enquiries, setEnquiries] = useState<any[]>([]),
    [tab, setTab] = useState('home'),
    [settings, setSettings] = useState('brand'),
    [menuOpen, setMenuOpen] = useState(false),
    [enquiryLoaded, setEnquiryLoaded] = useState(false),
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
  useEffect(() => {
    if (!authorized) return;
    api('admin/enquiries')
      .then((rows) => {
        setEnquiries(rows);
        setEnquiryLoaded(true);
      })
      .catch(() => setEnquiryLoaded(false));
  }, [authorized]);
  function navigate(view: string, group = '') {
    setTab(view);
    setMenuOpen(false);
    setStatus('');
    if (group) setSettings(group);
    if (view === 'enquiries')
      api('admin/enquiries')
        .then((rows) => {
          setEnquiries(rows);
          setEnquiryLoaded(true);
        })
        .catch((e) => setStatus(e.message));
  }
  function editSection(id: string) {
    setSection(data.sections.findIndex((s) => s.id === id));
    navigate('content');
  }
  const menu = [
    { title: 'Home', view: 'home', icon: LayoutDashboard },
    { title: 'Pages', view: 'pages', icon: Layers },
    { title: 'Posts / Blog', view: 'posts', icon: BriefcaseBusiness },
    { title: 'Home sections', view: 'content', icon: Layers },
    { title: 'Header menu', view: 'settings', group: 'navigation', icon: Menu },
    {
      title: 'Business details',
      view: 'settings',
      group: 'brand',
      icon: Building2,
    },
    {
      title: 'Services',
      view: 'content',
      section: 'services',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Consultation pricing',
      view: 'content',
      section: 'pricing',
      icon: BadgeIndianRupee,
    },
    {
      title: 'Questions & answers',
      view: 'content',
      section: 'faq',
      icon: HelpCircle,
    },
    {
      title: 'Website design',
      view: 'settings',
      group: 'theme',
      icon: Palette,
    },
    { title: 'Media', view: 'media', icon: ImagePlus },
    {
      title: 'Contact & footer',
      view: 'settings',
      group: 'contact',
      icon: Globe,
    },
    { title: 'Consultation enquiries', view: 'enquiries', icon: MessageSquare },
    { title: 'Account settings', view: 'security', icon: ShieldCheck },
  ];
  const title =
    tab === 'pages'
      ? 'Pages'
      : tab === 'posts'
        ? 'Posts / Blog'
        : tab === 'home'
          ? 'Home'
          : tab === 'content'
            ? 'Home sections'
            : tab === 'media'
              ? 'Website images'
              : tab === 'settings'
                ? menu.find((m) => m.group === settings)?.title
                : tab === 'enquiries'
                  ? 'Consultation enquiries'
                  : 'Account settings';
  const groups: Record<string, string[]> = {
    navigation: ['navigation'],
    brand: ['brand', 'founder'],
    theme: ['theme', 'labels', 'heroNote', 'artTag', 'heroCaption'],
    contact: ['contact', 'footer', 'form'],
  };
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
          ? 'Website published successfully.'
          : 'Draft saved. Your live website has not changed.',
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return (
      <div className="login-shell admin-light">Loading your workspace…</div>
    );
  if (!authorized)
    return (
      <main className="login-shell admin-light">
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
    <main className="admin admin-light">
      <aside
        className={'admin-rail ' + (menuOpen ? 'is-open' : '')}
        aria-label="Website administration"
      >
        <a href="/" className="rail-brand">
          <img src={data.brand.logo} alt="Business Destiny" />
          <span>WEBSITE ADMINISTRATION</span>
        </a>
        <nav>
          {menu.map(({ title: name, view, group, section: id, icon: Icon }) => {
            const active =
              tab === view &&
              (group
                ? settings === group
                : id
                  ? data.sections[section]?.id === id
                  : view !== 'content' ||
                    !['services', 'pricing', 'faq'].includes(
                      data.sections[section]?.id,
                    ));
            return (
              <button
                key={name}
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
                onClick={() => (id ? editSection(id) : navigate(view, group))}
              >
                <Icon size={19} />
                <span>{name}</span>
              </button>
            );
          })}
        </nav>
        <div className="rail-bottom">
          <CheckCircle2 size={18} />
          <div>
            Your website, in your hands.<small>Business Destiny Studio</small>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="rail-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="admin-workspace">
        <header className="admin-header">
          <div className="admin-heading">
            <button
              className="iconbutton rail-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </button>
            <div>
              <div className="eyebrow">BUSINESS DESTINY ADMIN</div>
              <h1>{title}</h1>
            </div>
          </div>
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
        <div className="admin-body">
          <div
            className={'admin-status ' + (dirty ? 'has-changes' : '')}
            role="status"
          >
            {status ||
              (dirty
                ? 'Unsaved changes — save a draft or publish when ready.'
                : 'Your workspace is ready. Saved drafts are separate from your live website.')}
          </div>
          <Tabs value={tab} onValueChange={(v) => navigate(String(v))}>
            <TabsContent value="home">
              <section className="dashboard-welcome">
                <div>
                  <div className="eyebrow">WELCOME TO BUSINESS DESTINY</div>
                  <h2>What would you like to do today?</h2>
                  <p>
                    Choose what you want to change. No technical knowledge
                    needed.
                  </p>
                </div>
                <a href="/" target="_blank" className="button outline small">
                  Open website <ArrowUpRight size={17} />
                </a>
              </section>
              <div className="dashboard-stats">
                {[
                  {
                    name: 'Visible sections',
                    value: data.sections.filter((s) => s.visible).length,
                    icon: Layers,
                  },
                  {
                    name: 'Services',
                    value:
                      data.sections.find((s) => s.id === 'services')?.items
                        .length || 0,
                    icon: BriefcaseBusiness,
                  },
                  {
                    name: 'Consultation plans',
                    value:
                      data.sections.find((s) => s.id === 'pricing')?.items
                        .length || 0,
                    icon: BadgeIndianRupee,
                  },
                  {
                    name: 'Enquiries',
                    value: enquiryLoaded ? enquiries.length : '—',
                    icon: MessageSquare,
                  },
                ].map(({ name, value, icon: Icon }) => (
                  <article key={name}>
                    <span className="dashboard-icon">
                      <Icon size={22} />
                    </span>
                    <div>
                      <strong>{value}</strong>
                      <p>{name}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="quick-heading">
                <h2>Quick actions</h2>
                <p>Make a change, preview it, then publish.</p>
              </div>
              <div className="quick-grid">
                {[
                  {
                    name: 'Edit your homepage',
                    description: 'Titles, text, section order and visibility',
                    button: 'EDIT HOME SECTIONS',
                    icon: Layers,
                    action: () => navigate('content'),
                  },
                  {
                    name: 'Update the header menu',
                    description: 'Add, rename and reorder navigation links',
                    button: 'EDIT HEADER MENU',
                    icon: Menu,
                    action: () => navigate('settings', 'navigation'),
                  },
                  {
                    name: 'Manage your services',
                    description:
                      'Business astrology, Vastu and consultation details',
                    button: 'EDIT SERVICES',
                    icon: BriefcaseBusiness,
                    action: () => editSection('services'),
                  },
                  {
                    name: 'Update consultation pricing',
                    description: 'Plans, prices and included services',
                    button: 'EDIT PRICING',
                    icon: BadgeIndianRupee,
                    action: () => editSection('pricing'),
                  },
                  {
                    name: 'Change website images',
                    description: 'Your logo, portraits and section images',
                    button: 'MANAGE IMAGES',
                    icon: ImagePlus,
                    action: () => navigate('media'),
                  },
                  {
                    name: 'Change website design',
                    description: 'Colours, typography and website labels',
                    button: 'EDIT WEBSITE DESIGN',
                    icon: Palette,
                    action: () => navigate('settings', 'theme'),
                  },
                  {
                    name: 'Read consultation enquiries',
                    description:
                      'See questions and contact details from visitors',
                    button: 'VIEW ENQUIRIES',
                    icon: MessageSquare,
                    action: () => navigate('enquiries'),
                  },
                  {
                    name: 'Update business details',
                    description: 'Brand information and founder profile',
                    button: 'EDIT BUSINESS DETAILS',
                    icon: Building2,
                    action: () => navigate('settings', 'brand'),
                  },
                  {
                    name: 'Edit contact & footer',
                    description: 'Contact information, links and enquiry form',
                    button: 'EDIT CONTACT DETAILS',
                    icon: Globe,
                    action: () => navigate('settings', 'contact'),
                  },
                ].map(({ name, description, button, icon: Icon, action }) => (
                  <article className="quick-card" key={name}>
                    <div>
                      <span className="dashboard-icon">
                        <Icon size={23} />
                      </span>
                      <div>
                        <h3>{name}</h3>
                        <p>{description}</p>
                      </div>
                    </div>
                    <button onClick={action}>
                      {button}
                      <ArrowRight size={17} />
                    </button>
                  </article>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="editor-panel">
                <h2>{title}</h2>
                <p>
                  Save a draft to preview your changes, or publish to update the
                  website.
                </p>
                <ObjectEditor
                  value={Object.fromEntries(
                    Object.entries(data).filter(([k]) =>
                      groups[settings].includes(k),
                    ),
                  )}
                  onChange={(v) => update({ ...data, ...v })}
                />
              </div>
            </TabsContent>
            <TabsContent value="pages">
              <PagesEditor
                data={data}
                onChange={update}
                Editor={ObjectEditor}
              />
            </TabsContent>
            <TabsContent value="posts">
              <PostsEditor
                data={data}
                onChange={update}
                Editor={ObjectEditor}
              />
            </TabsContent>
            <TabsContent value="media">
              <div className="editor-panel">
                <MediaLibrary data={data} onChange={update} />
                <h2>Website images</h2>
                <p>
                  Replace an image or upload a PNG, JPEG or WebP file under 5
                  MB. Save or publish to apply it.
                </p>
                <MediaEditor data={data} onChange={update} />
              </div>
            </TabsContent>
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
                        {i + 1}.{' '}
                        {s.id.startsWith('custom-') ? s.title : label(s.id)}
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
                    Save a draft to preview. Publish changes to update the
                    homepage.
                  </p>
                  {section >= 0 &&
                    data.sections[section]?.id.startsWith('custom-') && (
                      <button
                        className="button outline small"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Remove this custom section from the draft?',
                            )
                          ) {
                            update({
                              ...data,
                              sections: data.sections.filter(
                                (_, i) => i !== section,
                              ),
                            });
                            setSection(-1);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                        Remove section
                      </button>
                    )}
                  {section < 0 ? (
                    <ObjectEditor
                      value={Object.fromEntries(
                        Object.entries(data).filter(
                          ([k]) =>
                            ![
                              'sections',
                              'pages',
                              'posts',
                              'media',
                              'blog',
                            ].includes(k),
                        ),
                      )}
                      onChange={(v) =>
                        update({
                          ...data,
                          ...v,
                          sections: data.sections,
                        } as Content)
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
                {!enquiryLoaded ? (
                  <p>
                    Enquiries could not be loaded. Select Consultation enquiries
                    to retry.
                  </p>
                ) : !enquiries.length ? (
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
        </div>
      </div>
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
              value[0] !== undefined
                ? JSON.parse(JSON.stringify(value[0]))
                : path === 'navigation'
                  ? { label: 'New link', target: 'contact' }
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
          .filter(
            ([k]) =>
              k !== 'id' &&
              k !== 'homepageRevision' &&
              !(path === 'fields' && k === 'name'),
          )
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
function MediaEditor({
  data,
  onChange,
}: {
  data: Content;
  onChange: (v: Content) => void;
}) {
  const images: { path: (string | number)[]; value: string; title: string }[] =
    [];
  function collect(value: any, path: (string | number)[] = []) {
    if (!value || typeof value !== 'object') return;
    Object.entries(value).forEach(([key, v]) => {
      const next = [...path, Array.isArray(value) ? Number(key) : key];
      if (['image', 'logo'].includes(key) && typeof v === 'string') {
        const sectionName =
          path[0] === 'sections'
            ? data.sections[Number(path[1])]?.title
            : label(String(path[0] || 'Website'));
        images.push({
          path: next,
          value: v,
          title: sectionName || 'Section image',
        });
      } else collect(v, next);
    });
  }
  collect(data);
  return (
    <div className="media-grid">
      {images.map((image) => (
        <article className="media-card" key={image.path.join('.')}>
          <h3>{image.title}</h3>
          <ObjectEditor
            value={{ image: image.value }}
            onChange={(v) => {
              const next = structuredClone(data);
              let target: any = next;
              for (const key of image.path.slice(0, -1)) target = target[key];
              target[image.path.at(-1)!] = v.image;
              onChange(next);
            }}
          />
        </article>
      ))}
    </div>
  );
}
function label(s: string) {
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, (v) => v.toUpperCase());
}
