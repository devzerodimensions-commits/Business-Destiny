import defaults from '../content/default.json' with { type: 'json' };
// Extend older saved websites without overwriting their existing content.
export function upgradeContent(content) {
  return {
    ...content,
    pages: content.pages ?? [],
    posts: content.posts ?? structuredClone(defaults.posts),
    media: content.media ?? [],
    blog: { ...defaults.blog, ...content.blog },
    footer: { ...defaults.footer, ...content.footer },
  };
}
export function publicContent(content) {
  const c = upgradeContent(content);
  return {
    ...c,
    pages: c.pages.filter((p) => p.published),
    posts: c.posts.filter((p) => p.published),
    media: [],
  };
}
export function validateCMS(c, fail) {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const key of ['pages', 'posts']) {
    if (!Array.isArray(c[key]) || c[key].length > 100)
      fail('Use up to 100 ' + key + '.');
    const slugs = new Set(),
      ids = new Set();
    for (const item of c[key]) {
      if (
        !item ||
        typeof item.id !== 'string' ||
        ids.has(item.id) ||
        typeof item.slug !== 'string' ||
        item.slug.length > 100 ||
        !slugPattern.test(item.slug) ||
        slugs.has(item.slug)
      )
        fail(
          'Each ' +
            key +
            ' entry needs a unique ID and URL slug (lowercase letters, numbers and hyphens).',
        );
      ids.add(item.id);
      slugs.add(item.slug);
      if (
        typeof item.title !== 'string' ||
        !item.title.trim() ||
        typeof item.published !== 'boolean'
      )
        fail('Add a title and publication status.');
      if (key === 'posts') {
        for (const field of [
          'excerpt',
          'body',
          'category',
          'author',
          'date',
          'image',
          'imageAlt',
        ])
          if (typeof item[field] !== 'string') fail('Invalid post ' + field);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
          !Number.isFinite(Date.parse(item.date))
        )
          fail('Choose a valid post date.');
      } else {
        if (!Array.isArray(item.sections) || item.sections.length > 30)
          fail('Use up to 30 sections per page.');
        const sectionIds = new Set();
        for (const section of item.sections) {
          if (
            !section ||
            typeof section.id !== 'string' ||
            sectionIds.has(section.id) ||
            typeof section.visible !== 'boolean' ||
            !['text', 'image', 'cards', 'cta'].includes(section.type)
          )
            fail('Invalid page section.');
          sectionIds.add(section.id);
          for (const field of [
            'title',
            'description',
            'body',
            'image',
            'imageAlt',
            'buttonLabel',
            'buttonUrl',
          ])
            if (typeof section[field] !== 'string')
              fail('Invalid page section ' + field);
          if (
            !Array.isArray(section.items) ||
            section.items.length > 40 ||
            section.items.some(
              (i) =>
                !i ||
                typeof i.title !== 'string' ||
                typeof i.description !== 'string',
            )
          )
            fail('Invalid page cards.');
        }
      }
    }
  }
  if (
    !Array.isArray(c.media) ||
    c.media.length > 200 ||
    c.media.some(
      (m) =>
        !m ||
        typeof m.name !== 'string' ||
        typeof m.image !== 'string' ||
        typeof m.id !== 'string',
    )
  )
    fail('Invalid media library (up to 200 images).');
  if (
    !c.blog ||
    typeof c.blog.visible !== 'boolean' ||
    ['eyebrow', 'title', 'description', 'linkLabel', 'allLabel'].some(
      (k) => typeof c.blog[k] !== 'string',
    )
  )
    fail('Invalid journal settings.');
  if (
    !Array.isArray(c.footer.columns) ||
    c.footer.columns.length > 4 ||
    c.footer.columns.some(
      (col) =>
        !col ||
        typeof col.title !== 'string' ||
        !Array.isArray(col.links) ||
        col.links.length > 15 ||
        col.links.some(
          (l) =>
            !l || typeof l.label !== 'string' || typeof l.href !== 'string',
        ),
    )
  )
    fail('Invalid footer links.');
  function links(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, v] of Object.entries(value)) {
      if (
        ['href', 'buttonUrl'].includes(key) &&
        typeof v === 'string' &&
        v &&
        !/^(\/(?!\/)|#[a-z0-9-]|https:\/\/|mailto:|tel:)/i.test(v)
      )
        fail('Links must use a website path, HTTPS, email or phone URL.');
      if (v && typeof v === 'object') links(v);
    }
  }
  links(c);
}
