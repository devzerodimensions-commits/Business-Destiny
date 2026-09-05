import { ArrowRight, ArrowUpRight, Mail, Phone } from 'lucide-react';
import type { Content } from './page';
export function BlogCards({
  c,
  all = false,
  preview = false,
}: {
  c: Content;
  all?: boolean;
  preview?: boolean;
}) {
  const posts = c.posts
    .filter((p) => preview || p.published)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!all && (!c.blog.visible || !posts.length)) return null;
  return (
    <section className="journal-section wrap" id="journal">
      <div className="journal-heading">
        <div>
          <div className="eyebrow">{c.blog.eyebrow}</div>
          <h2>{c.blog.title}</h2>
          <p>{c.blog.description}</p>
        </div>
        {!all && (
          <a
            className="textlink"
            href={'/blog' + (preview ? '?preview=1' : '')}
          >
            {c.blog.allLabel}
            <ArrowUpRight size={18} />
          </a>
        )}
      </div>
      <div className="journal-grid">
        {(all ? posts : posts.slice(0, 3)).map((p) => (
          <article className="journal-card" key={p.id}>
            <a
              href={'/blog/' + p.slug + (preview ? '?preview=1' : '')}
              tabIndex={-1}
              aria-hidden="true"
            >
              {p.image && <img src={p.image} alt={p.imageAlt} />}
            </a>
            <div>
              <span className="journal-category">{p.category}</span>
              <h3>
                <a href={'/blog/' + p.slug + (preview ? '?preview=1' : '')}>
                  {p.title}
                </a>
              </h3>
              <p>{p.excerpt}</p>
              <a
                className="textlink"
                href={'/blog/' + p.slug + (preview ? '?preview=1' : '')}
              >
                {c.blog.linkLabel}
                <ArrowRight size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>
      {!posts.length && <p>No articles have been published yet.</p>}
    </section>
  );
}
export function ContentRoute({
  c,
  path,
  preview,
}: {
  c: Content;
  path: string;
  preview: boolean;
}) {
  if (path === '/blog') return <BlogCards c={c} all preview={preview} />;
  const post = path.startsWith('/blog/')
    ? c.posts.find(
        (p) => '/blog/' + p.slug === path && (preview || p.published),
      )
    : null;
  if (post)
    return (
      <article className="article-page wrap">
        <a className="textlink" href={'/blog' + (preview ? '?preview=1' : '')}>
          ← All articles
        </a>
        <div className="eyebrow">{post.category}</div>
        <h1>{post.title}</h1>
        <p className="article-meta">
          {post.author} · <time dateTime={post.date}>{post.date}</time>
        </p>
        <p className="article-intro">{post.excerpt}</p>
        {post.image && (
          <img className="article-image" src={post.image} alt={post.imageAlt} />
        )}
        <div className="article-body">
          {post.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    );
  const page = c.pages.find(
    (p) => '/pages/' + p.slug === path && (preview || p.published),
  );
  if (page)
    return (
      <div className="dynamic-page">
        <header className="wrap page-title">
          <div className="eyebrow">{c.brand.name}</div>
          <h1>{page.title}</h1>
        </header>
        {page.sections
          .filter((s) => s.visible)
          .map((s) => (
            <section className={'page-block wrap block-' + s.type} key={s.id}>
              {s.image && (s.type === 'image' || s.type === 'text') && (
                <img src={s.image} alt={s.imageAlt} />
              )}
              <div>
                <h2>{s.title}</h2>
                <p className="article-intro">{s.description}</p>
                <div className="article-body">
                  {s.body.split(/\n\s*\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {s.type === 'cards' && (
                  <div className="service-grid">
                    {s.items.map((item, i) => (
                      <article className="service-card" key={i}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </article>
                    ))}
                  </div>
                )}
                {s.buttonLabel && s.buttonUrl && (
                  <a className="button" href={s.buttonUrl}>
                    {s.buttonLabel}
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </div>
            </section>
          ))}
      </div>
    );
  return (
    <div className="wrap page-title">
      <h1>Page not found</h1>
      <p>This page is unavailable or has not been published.</p>
      <a className="button" href="/">
        Back to home
      </a>
    </div>
  );
}
export function SiteFooter({ c }: { c: Content }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-callout">
          <div>
            <div className="eyebrow">{c.brand.name}</div>
            <h2>{c.footer.tagline}</h2>
          </div>
          <a className="button" href="/#contact">
            {c.labels.book}
            <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="footer-columns">
          <div className="footer-business">
            <a href="/">
              <img src={c.brand.logo} alt={c.brand.name} />
            </a>
            <p>{c.brand.strapline}</p>
            <small>{c.footer.note}</small>
          </div>
          {c.footer.columns.map((col, i) => (
            <div key={i}>
              <h3>{col.title}</h3>
              <nav aria-label={col.title}>
                {col.links.map((link, j) => (
                  <a key={j} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
          <div className="footer-contact">
            <h3>{c.footer.contactTitle}</h3>
            <p>{c.footer.contactText}</p>
            {c.contact.email && (
              <a href={'mailto:' + c.contact.email}>
                <Mail size={16} />
                {c.contact.email}
              </a>
            )}
            {c.contact.phone && (
              <a href={'tel:' + c.contact.phone.replace(/[^+0-9]/g, '')}>
                <Phone size={16} />
                {c.contact.phone}
              </a>
            )}
            <a className="textlink" href="/#contact">
              {c.labels.book}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {c.brand.name}. {c.footer.rights}
          </span>
          <a href="/admin">Admin login</a>
        </div>
      </div>
    </footer>
  );
}
