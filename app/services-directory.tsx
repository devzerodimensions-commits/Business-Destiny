import { ArrowRight, ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import type { CMSPage, Content } from './page';
import { SiteImage } from './site-image';

export function availableServices(c: Content, preview: boolean) {
  const ids = new Set(
    c.sections
      .filter((s) => ['services', 'consultation-preparation'].includes(s.id))
      .flatMap((s) => s.items.map((i) => i.pageId)),
  );
  return c.pages.filter(
    (p) => ids.has(p.id) && !p.trashedAt && (preview || p.published),
  );
}
export function serviceHref(page: CMSPage, preview: boolean) {
  return '/pages/' + page.slug + (preview ? '?preview=1' : '');
}
export function ServicesDirectory({
  c,
  preview,
}: {
  c: Content;
  preview: boolean;
}) {
  const pages = availableServices(c, preview);
  const practices = pages.filter((p) => !p.id.startsWith('business-service-'));
  const challenges = pages.filter((p) => p.id.startsWith('business-service-'));
  return (
    <div className="services-directory">
      <section className="directory-hero wrap">
        <div>
          <a className="directory-breadcrumb" href="/">
            Home <span>/</span> Services
          </a>
          <div className="eyebrow">A PERSPECTIVE FOR EVERY CHAPTER</div>
          <h1>
            Your business.
            <br />
            Your questions.
            <br />
            <em>A place to begin.</em>
          </h1>
          <p>
            From a new beginning to an important decision, explore a
            consultation shaped around what matters to your business.
          </p>
          <a className="button" href="#business-services">
            Find your service <ArrowRight size={18} />
          </a>
        </div>
        <div className="directory-art">
          <SiteImage loading="eager" fetchPriority="high"
            src="/media/service-astrology.png"
            alt="A golden zodiac wheel illustrating traditional astrology"
          />
          <div className="directory-art-caption">
            <Sparkles size={20} />
            <span>
              Traditional wisdom.
              <br />
              <strong>A personal perspective.</strong>
            </span>
          </div>
        </div>
      </section>
      {practices.length > 0 && (
        <section className="directory-practices">
          <div className="wrap">
            <div className="directory-section-heading">
              <div>
                <div className="eyebrow">OUR PRACTICES</div>
                <h2>
                  Different perspectives.
                  <br />
                  <em>One thoughtful conversation.</em>
                </h2>
              </div>
              <p>
                Discover the traditions behind our consultations and what to
                prepare before we meet.
              </p>
            </div>
            <div className="directory-practice-grid">
              {practices.map((p, i) => {
                const hero = p.sections.find(
                  (s) => s.type === 'hero' && s.visible,
                );
                return (
                  <a
                    key={p.id}
                    className="directory-practice"
                    href={serviceHref(p, preview)}
                  >
                    <span className="directory-number">
                      0{i + 1} / PRACTICE
                    </span>
                    {hero?.image && (
                    <SiteImage sizes="(max-width: 700px) 100vw, 25vw"
                        src={hero.image}
                        alt={hero.imageAlt}
                        loading="lazy"
                      />
                    )}
                    <h3>
                      {p.title}
                      <ArrowUpRight size={22} />
                    </h3>
                    <p>{hero?.description}</p>
                    <span className="textlink">
                      Discover the practice <ArrowRight size={16} />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
      <section className="directory-challenges wrap" id="business-services">
        <div className="directory-section-heading">
          <div>
            <div className="eyebrow">FIND YOUR FOCUS</div>
            <h2>What’s on your mind?</h2>
          </div>
          <p>
            Choose a service to explore the discussion topics, consultation
            process and details to bring.
          </p>
        </div>
        <div className="directory-challenge-grid">
          {challenges.map((p, i) => (
            <a
              className="directory-challenge"
              key={p.id}
              href={serviceHref(p, preview)}
            >
              <span className="directory-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{p.title}</h3>
              <p>
                {
                  p.sections.find((s) => s.type === 'hero' && s.visible)
                    ?.description
                }
              </p>
              <span className="textlink">
                Explore service <ArrowUpRight size={17} />
              </span>
            </a>
          ))}
        </div>
        {!pages.length && (
          <p>
            Service details are being updated. Get in touch to discuss your
            question.
          </p>
        )}
      </section>
      <section className="directory-help wrap">
        <Compass size={42} strokeWidth={1} />
        <div>
          <div className="eyebrow">START WITH A CONVERSATION</div>
          <h2>Not sure where to begin?</h2>
          <p>
            Tell us what you are working through. We can help clarify the scope
            of your consultation.
          </p>
        </div>
        <a className="button" href="/#contact">
          Let’s talk <ArrowUpRight size={18} />
        </a>
      </section>
    </div>
  );
}

export function ServiceNavigation({
  page,
  preview,
}: {
  page: CMSPage;
  preview: boolean;
}) {
  const sections = page.sections.filter(
    (s) => s.visible && s.type !== 'hero' && s.type !== 'cta',
  );
  const labels = [
    'What we explore',
    'Your consultation',
    'Before we meet',
    'Common questions',
  ];
  return (
    <nav className="service-section-nav" aria-label="On this service page">
      <a href={'/services' + (preview ? '?preview=1' : '')}>
        All services <ArrowUpRight size={14} />
      </a>
      {sections.map((s, i) => (
        <a key={s.id} href={'#' + s.id}>
          {page.id.startsWith('business-service-')
            ? labels[i] || s.title
            : s.title}
        </a>
      ))}
    </nav>
  );
}
