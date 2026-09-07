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
  assert.equal(guide.title, 'Four disciplines.');
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

test('Chakra settings upgrade old content, preserve edits and reject unsafe ranges', () => {
  const old = structuredClone(defaults);
  delete old.chakra;
  const upgraded = upgradeContent(old);
  assert.deepEqual(upgraded.chakra, defaults.chakra);
  upgraded.chakra.speed = 2.4;
  upgraded.chakra.autoRotate = false;
  assert.equal(upgradeContent(upgraded).chakra.speed, 2.4);
  assert.equal(upgradeContent(upgraded).chakra.autoRotate, false);
  validateCMS(upgraded, fail);
  upgraded.chakra.scale = 99;
  assert.throws(() => validateCMS(upgraded, fail), /chakra scale/);
  upgraded.chakra.scale = 1;
  upgraded.chakra.surface = 'invalid';
  assert.throws(() => validateCMS(upgraded, fail), /chakra colour/);
});

test('Trashed pages stay in admin content but are excluded from public pages and menus', () => {
  const c = structuredClone(defaults);
  const page = {
    id: 'trash-test',
    slug: 'test-page',
    title: 'Test page',
    published: true,
    sections: [],
    trashedAt: new Date().toISOString(),
  };
  c.pages.push(page);
  c.navigation.push({ label: 'Test page', target: '/pages/test-page' });
  c.footer.columns[0].links.push({
    label: 'Test page',
    href: '/pages/test-page',
  });
  validateCMS(c, fail);
  const pub = publicContent(c);
  assert.ok(!pub.pages.some((p) => p.id === page.id));
  assert.ok(!pub.navigation.some((n) => n.target === '/pages/test-page'));
  assert.ok(
    !pub.footer.columns[0].links.some((l) => l.href === '/pages/test-page'),
  );
  assert.ok(c.pages.some((p) => p.id === page.id));
  delete page.trashedAt;
  assert.ok(publicContent(c).pages.some((p) => p.id === page.id));
  page.sections.push({
    id: 'block',
    type: 'text',
    visible: true,
    title: 'Title',
    description: '',
    body: '',
    image: '',
    imageAlt: '',
    buttonLabel: '',
    buttonUrl: '',
    items: [],
    design: {
      background: '#ffffff',
      text: '#123456',
      align: 'center',
      padding: 20,
      columns: 2,
    },
  });
  validateCMS(c, fail);
  page.sections[0].design.padding = -1;
  assert.throws(() => validateCMS(c, fail), /section design/);
});
