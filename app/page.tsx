'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Compass,
  Factory,
  ChartNoAxesCombined,
  Handshake,
  Orbit,
  ShieldCheck,
  Menu,
  X,
  Check,
  Plus,
} from 'lucide-react';
import initial from '@/content/default.json';
import Chakra from './chakra';
import { BlogCards, ContentRoute, SiteFooter } from './cms-public';
import { BusinessMilestones, ConsultationPreparation } from './home-extras';

export type Item = {
  title: string;
  description?: string;
  featured?: boolean;
  subtitle?: string;
  price?: string;
  duration?: string;
  features?: string;
  image?: string;
  imageAlt?: string;
};
export type Section = {
  id: string;
  visible: boolean;
  title: string;
  highlight: string;
  description: string;
  body: string;
  eyebrow: string;
  image: string;
  imageAlt: string;
  items: Item[];
};
export type PageSection = {
  id: string;
  type: 'text' | 'image' | 'cards' | 'cta';
  visible: boolean;
  title: string;
  description: string;
  body: string;
  image: string;
  imageAlt: string;
  buttonLabel: string;
  buttonUrl: string;
  items: { title: string; description: string }[];
};
export type CMSPage = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sections: PageSection[];
};
export type MediaRecord = { id: string; name: string; image: string };
export type Content = Omit<typeof initial, 'sections' | 'pages' | 'media'> & {
  sections: Section[];
  pages: CMSPage[];
  media: MediaRecord[];
};
export async function api(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  const res = await fetch('/api/' + path, {
    ...init,
    headers,
  });
  const data: any = await res.json();
  if (!res.ok) throw Error(data.error || 'Please try again.');
  return data;
}
const icons = [
  ChartNoAxesCombined,
  Compass,
  Factory,
  Handshake,
  Orbit,
  Sparkles,
];
export default function Home() {
  const [c, setC] = useState<Content>(initial);
  const [menu, setMenu] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [route, setRoute] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const loadedRoute = location.pathname.replace(/\/$/, '') || '';
    if (new URLSearchParams(location.search).has('preview')) {
      api('admin/content')
        .then((x) => {
          setC(x.draft);
          setPreview(true);
        })
        .catch(() => setError('Sign in to preview unpublished changes.'))
        .finally(() => setRoute(loadedRoute));
    } else {
      api('content')
        .then(setC)
        .catch(() =>
          setError('Live content is unavailable. Showing the saved homepage.'),
        )
        .finally(() => setRoute(loadedRoute));
    }
  }, []);
  return (
    <div
      className={'site layout-' + c.theme.layout}
      style={
        {
          '--accent': c.theme.accent,
          '--sky': c.theme.sky,
          '--bg': c.theme.background,
          '--radius': c.theme.roundness + 'px',
        } as CSSProperties
      }
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      {(preview || error) && (
        <div className="preview-bar" role="status">
          {error || 'Unpublished draft preview'}{' '}
          <a href="/admin">Return to editor →</a>
        </div>
      )}
      <div className="topline">
        <span>{c.brand.strapline}</span>
        <span>
          {c.brand.availability}
          <i />
        </span>
      </div>
      <header className="header wrap">
        <a href="/" className="brand">
          <img src={c.brand.logo} alt="Business Destiny logo" />
          <span>
            {c.brand.name}
            <small>{c.brand.descriptor}</small>
          </span>
        </a>
        <nav className={menu ? 'nav open' : 'nav'} aria-label="Main navigation">
          {c.navigation
            .filter(
              (n) =>
                c.sections.some((s) => s.id === n.target && s.visible) ||
                n.target === '/blog' ||
                c.pages.some(
                  (p) => '/pages/' + p.slug === n.target && p.published,
                ),
            )
            .map((n) => (
              <a
                key={n.target}
                href={n.target.startsWith('/') ? n.target : '/#' + n.target}
                onClick={() => setMenu(false)}
              >
                {n.label}
              </a>
            ))}
        </nav>
        <a className="button small header-cta" href="/#contact">
          {c.labels.book}
          <ArrowUpRight size={16} />
        </a>
        <button
          className="menu iconbutton"
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        {route ? (
          <ContentRoute c={c} path={route} preview={preview} />
        ) : (
          <>
            {c.sections
              .filter((s) => s.visible)
              .map((s) => (
                <section id={s.id} key={s.id} className={'section ' + s.id}>
                  {s.id === 'hero' ? (
                    <div className="hero-grid wrap">
                      <div className="hero-copy">
                        <div className="eyebrow">
                          <span className="line" />
                          {s.eyebrow}
                        </div>
                        <h1>
                          {s.title}
                          <br />
                          <em>{s.highlight}</em>
                        </h1>
                        <p className="hero-description">{s.description}</p>
                        {s.body && (
                          <p className="industrial-hero-topics">{s.body}</p>
                        )}
                        <div className="actions">
                          <a className="button" href="#contact">
                            {c.labels.book}
                            <ArrowUpRight size={19} />
                          </a>
                          <a className="textlink" href="#services">
                            {c.labels.explore}
                            <ArrowRight size={17} />
                          </a>
                        </div>
                        <div className="hero-foot">
                          <ShieldCheck size={21} />
                          <span>{c.heroNote}</span>
                        </div>
                      </div>
                      <div className="hero-art industrial-hero-art chakra-hero">
                        <Chakra
                          accent={c.theme.accent}
                          highlight={c.theme.sky}
                          fallback={c.brand.logo}
                        />
                        <div className="art-caption">{c.artTag.caption}</div>
                      </div>
                    </div>
                  ) : s.id === 'industrial-questions' ||
                    s.id === 'industrial-scenarios' ? (
                    <div className="wrap industrial-editorial">
                      <Heading s={s} />
                      <div className="industrial-topic-grid">
                        {s.items.map((item, i) => (
                          <article key={i}>
                            <span className="industrial-topic-number">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <a className="textlink" href="#contact">
                              {c.labels.discuss}
                              <ArrowUpRight size={15} />
                            </a>
                          </article>
                        ))}
                      </div>
                      {s.body && (
                        <p className="industrial-context-note">{s.body}</p>
                      )}
                    </div>
                  ) : s.id === 'industries' ? (
                    <div className="industry-strip wrap">
                      <span className="eyebrow">{s.title}</span>
                      <div>
                        {s.items.map((i, j) => (
                          <span key={j}>
                            {i.title}
                            <span className="sky">✦</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : s.id === 'services' ? (
                    <div className="wrap">
                      <Heading s={s} />
                      <div className="service-grid">
                        {s.items.map((i, j) => {
                          const Icon = icons[j % icons.length];
                          return (
                            <a href="#contact" className="service-card" key={j}>
                              <div className="card-top">
                                <Icon size={29} strokeWidth={1.25} />
                                <span>0{j + 1}</span>
                              </div>
                              <h3>{i.title}</h3>
                              <p>{i.description}</p>
                              <span className="service-link">
                                {c.labels.discuss}
                                <ArrowUpRight size={18} />
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : s.id === 'business-milestones' ? (
                    <BusinessMilestones s={s} buttonLabel={c.labels.discuss} />
                  ) : s.id === 'consultation-preparation' ? (
                    <ConsultationPreparation
                      s={s}
                      buttonLabel={c.labels.discuss}
                      onSelect={(service) =>
                        setSelectedService(
                          c.sections
                            .filter((s) =>
                              ['services', 'consultation-preparation'].includes(
                                s.id,
                              ),
                            )
                            .some((s) =>
                              s.items.some(
                                (i) => (i.subtitle || i.title) === service,
                              ),
                            )
                            ? service
                            : '',
                        )
                      }
                    />
                  ) : s.id === 'about' ? (
                    <div className="wrap about-grid">
                      <div className="about-visual">
                        <img src={s.image} alt={s.imageAlt} />
                        <span>
                          {c.brand.name}
                          <small>{c.brand.descriptor}</small>
                        </span>
                      </div>
                      <div>
                        <Heading s={s} />
                        <p>{s.body}</p>
                        <div className="expertise">
                          {s.items.map((i, j) => (
                            <span key={j}>
                              <Check size={15} />
                              {i.title}
                            </span>
                          ))}
                        </div>
                        <div className="signature">
                          <h3>{c.founder.name}</h3>
                          <span>{c.founder.role}</span>
                        </div>
                        <a href="#contact" className="textlink">
                          {c.labels.meet}
                          <ArrowUpRight size={18} />
                        </a>
                      </div>
                    </div>
                  ) : s.id === 'process' ? (
                    <div className="wrap">
                      <Heading s={s} />
                      <div className="process-grid">
                        {s.items.map((i, j) => (
                          <div className="process-step" key={j}>
                            <span className="step">0{j + 1}</span>
                            <h3>{i.title}</h3>
                            <p>{i.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : s.id === 'pricing' ? (
                    <div className="wrap">
                      <Heading s={s} />
                      <div className="pricing-grid">
                        {s.items.map((i, j) => (
                          <article
                            className={
                              'price-card ' + (i.featured ? 'featured' : '')
                            }
                            key={j}
                          >
                            {i.featured && (
                              <span className="recommended">
                                {c.labels.recommended}
                              </span>
                            )}
                            <span className="eyebrow">{i.subtitle}</span>
                            <h3>{i.title}</h3>
                            <div className="price">
                              {i.price}
                              <small>{i.duration}</small>
                            </div>
                            <p>{i.description}</p>
                            <ul>
                              {i.features?.split('\n').map((f) => (
                                <li key={f}>
                                  <Check size={16} />
                                  {f}
                                </li>
                              ))}
                            </ul>
                            <a
                              className={
                                i.featured ? 'button' : 'button outline'
                              }
                              href="#contact"
                            >
                              {c.labels.choose}
                              <ArrowUpRight size={17} />
                            </a>
                          </article>
                        ))}
                      </div>
                      <p className="pricing-note">{s.body}</p>
                    </div>
                  ) : s.id === 'faq' ? (
                    <div className="wrap faq-grid">
                      <Heading s={s} />
                      <div className="faqs">
                        {s.items.map((i, j) => (
                          <details key={j}>
                            <summary>
                              {i.title}
                              <Plus size={19} />
                            </summary>
                            <p>{i.description}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  ) : s.id === 'contact' ? (
                    <div className="wrap contact-grid">
                      <div>
                        <Heading s={s} />
                        <div className="contact-note">
                          <ShieldCheck />
                          <p>{s.body}</p>
                        </div>
                        {c.contact.email && (
                          <a
                            className="textlink"
                            href={'mailto:' + c.contact.email}
                          >
                            {c.contact.email}
                            <ArrowUpRight size={16} />
                          </a>
                        )}
                        {c.contact.phone && (
                          <p>
                            <a href={'tel:' + c.contact.phone}>
                              {c.contact.phone}
                            </a>
                          </p>
                        )}
                        {c.contact.whatsapp && (
                          <a
                            className="textlink"
                            href={
                              'https://wa.me/' +
                              c.contact.whatsapp.replace(/\D/g, '')
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {c.labels.whatsapp}
                            <ArrowUpRight size={16} />
                          </a>
                        )}
                      </div>
                      <Enquiry
                        c={c}
                        selectedService={selectedService}
                        onServiceChange={setSelectedService}
                      />
                    </div>
                  ) : (
                    <div className="wrap">
                      <Heading s={s} />
                      {s.image && (
                        <img
                          className="custom-image"
                          src={s.image}
                          alt={s.imageAlt}
                        />
                      )}
                      <p>{s.body}</p>
                      <div className="service-grid">
                        {s.items.map((i, j) => (
                          <article className="service-card" key={j}>
                            <h3>{i.title}</h3>
                            <p>{i.description}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            <BlogCards c={c} preview={preview} />
          </>
        )}
      </main>
      <SiteFooter c={c} />
    </div>
  );
}
function Heading({ s }: { s: Content['sections'][number] }) {
  return (
    <div className="section-heading">
      <div className="eyebrow">
        <span className="line" />
        {s.eyebrow}
      </div>
      <h2>
        {s.title} {s.highlight && <em>{s.highlight}</em>}
      </h2>
      {s.description && <p>{s.description}</p>}
    </div>
  );
}
function Enquiry({
  c,
  selectedService,
  onServiceChange,
}: {
  c: Content;
  selectedService: string;
  onServiceChange: (s: string) => void;
}) {
  const [state, setState] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setState('');
    try {
      await api('enquiries', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      setSuccess(true);
      setState(c.form.success);
      form.reset();
      onServiceChange('');
    } catch (e) {
      setState((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="enquiry">
      <div className="form-grid">
        {c.form.fields.map((f) => (
          <label key={f.name}>
            {f.label}
            {f.required && ' *'}
            <input
              type={f.type}
              name={f.name}
              required={f.required}
              placeholder={f.placeholder}
              maxLength={180}
            />
          </label>
        ))}
      </div>
      <label>
        {c.form.serviceLabel}
        <select
          name="service"
          value={selectedService}
          onChange={(e) => onServiceChange(e.target.value)}
        >
          <option value="">{c.form.servicePlaceholder}</option>
          {c.sections
            .find((s) => s.id === 'consultation-preparation')
            ?.items.filter(
              (i) =>
                !c.sections
                  .filter((s) => ['services', 'pricing'].includes(s.id))
                  .some((s) =>
                    s.items.some((x) => x.title === (i.subtitle || i.title)),
                  ),
            )
            .map((i) => (
              <option key={i.subtitle || i.title}>
                {i.subtitle || i.title}
              </option>
            ))}
          {c.sections
            .find((s) => s.id === 'pricing')
            ?.items.map((i) => (
              <option key={i.title}>{i.title}</option>
            ))}
          {c.sections
            .find((s) => s.id === 'services')
            ?.items.map((i) => (
              <option key={i.title}>{i.title}</option>
            ))}
        </select>
      </label>
      <label>
        {c.form.questionLabel}
        <textarea
          name="question"
          required
          maxLength={3000}
          rows={3}
          placeholder={c.form.questionPlaceholder}
        />
      </label>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="honeypot"
        aria-hidden="true"
      />
      <label className="consent">
        <input type="checkbox" name="consent" required />
        {c.form.consent}
      </label>
      <button className="button" disabled={busy}>
        {busy ? c.form.sending : c.form.submit}
        <ArrowUpRight size={17} />
      </button>
      {state && (
        <p role="status" className={success ? 'success' : 'error'}>
          {state}
        </p>
      )}
    </form>
  );
}
