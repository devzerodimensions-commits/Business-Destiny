import { test } from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../content/default.json' with { type: 'json' };
import { upgradeContent, publicContent, validateCMS } from './cms.mjs';
import { handleAPI } from './api.mjs';
const fail = (message) => {
  throw Error(message);
};
test('Homepage additions upgrade once and preserve later admin choices', () => {
  const old = structuredClone(defaults);
  delete old.homepageRevision;
  old.sections = old.sections.filter(
    (s) => !['business-milestones', 'consultation-preparation'].includes(s.id),
  );
  old.sections.find((s) => s.id === 'about').image =
    '/media/business-destiny-hd.png';
  const next = upgradeContent(old);
  assert.equal(next.sections.length, old.sections.length + 2);
  assert.equal(
    next.sections.find((s) => s.id === 'about').image,
    '/media/tejas-parikh-portrait.png',
  );
  assert.equal(
    old.sections.find((s) => s.id === 'about').image,
    '/media/business-destiny-hd.png',
  );
  next.sections.find((s) => s.id === 'business-milestones').visible = false;
  next.sections.find((s) => s.id === 'about').image = '/media/owner-photo.png';
  const again = upgradeContent(next);
  assert.equal(again.sections.length, next.sections.length);
  assert.equal(
    again.sections.find((s) => s.id === 'business-milestones').visible,
    false,
  );
  assert.equal(
    again.sections.find((s) => s.id === 'about').image,
    '/media/owner-photo.png',
  );
});
test('Consultation guide replaces the old section once and retains visibility', () => {
  const old = structuredClone(defaults);
  old.homepageRevision = 2;
  const section = old.sections.find((s) => s.id === 'consultation-preparation');
  section.title = 'Bring your questions.';
  section.visible = false;
  const updated = upgradeContent(old);
  const guide = updated.sections.find((s) => s.id === section.id);
  assert.equal(guide.title, 'Four perspectives.');
  assert.equal(guide.items.length, 4);
  assert.ok(guide.items.every((item) => item.image && item.imageAlt));
  assert.equal(guide.visible, false);
  guide.title = 'Owner edited heading';
  assert.equal(
    upgradeContent(updated).sections.find((s) => s.id === section.id).title,
    'Owner edited heading',
  );
});
test('Existing content upgrades without overwriting edits; public API excludes drafts and media inventory', async () => {
  const old = structuredClone(defaults);
  delete old.posts;
  delete old.pages;
  delete old.blog;
  delete old.media;
  delete old.footer.columns;
  old.footer.tagline = 'Owner custom footer';
  const c = upgradeContent(old);
  assert.equal(c.footer.tagline, 'Owner custom footer');
  assert.equal(c.posts.length, 3);
  assert.equal(c.footer.columns.length, 2);
  c.pages = [
    {
      id: 'one',
      slug: 'private-page',
      title: 'Secret page',
      published: false,
      sections: [],
    },
    {
      id: 'two',
      slug: 'public-page',
      title: 'Public page',
      published: true,
      sections: [],
    },
  ];
  c.posts[0].published = false;
  c.media = [{ id: 'm', name: 'Private inventory', image: '/media/test.png' }];
  validateCMS(c, fail);
  const response = await handleAPI(
    new Request('https://example.com/api/content'),
    {
      DB: {
        prepare() {
          return {
            bind() {
              return { first: () => ({ value: JSON.stringify(c) }) };
            },
          };
        },
      },
    },
  );
  assert.equal(response.status, 200);
  const visible = await response.json();
  assert.deepEqual(
    visible.pages.map((p) => p.slug),
    ['public-page'],
  );
  assert.equal(visible.posts.length, 2);
  assert.deepEqual(visible.media, []);
  assert.equal(c.pages.length, 2);
  assert.equal(publicContent(c).footer.tagline, 'Owner custom footer');
});
test('CMS rejects duplicate slugs, unsupported sections and unsafe links', () => {
  const c = structuredClone(defaults);
  validateCMS(c, fail);
  c.posts[1].slug = c.posts[0].slug;
  assert.throws(() => validateCMS(c, fail), /unique/);
  c.posts[1].slug = 'second-post';
  c.footer.columns[0].links[0].href = 'javascript:alert(1)';
  assert.throws(() => validateCMS(c, fail), /Links must/);
  c.footer.columns[0].links[0].href = '/';
  c.pages = [
    {
      id: 'p',
      title: 'Page',
      slug: 'my-page',
      published: false,
      sections: [{ id: 's', type: 'script', visible: true }],
    },
  ];
  assert.throws(() => validateCMS(c, fail), /Invalid page section/);
});
