import { test } from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../content/default.json' with { type: 'json' };
import { upgradeContent, publicContent, validateCMS } from './cms.mjs';
import { handleAPI } from './api.mjs';
const fail = (message) => {
  throw Error(message);
};
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
