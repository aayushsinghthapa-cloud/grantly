/**
 * Static pre-rendering for every route.
 *
 * Runs after `vite build`. Serves dist/, renders each route in headless Chrome as a first-time
 * visitor (so the labelled sample student is loaded and every screen shows real content) with
 * reduced motion (so content is in its finished state), and writes dist/<route>/index.html.
 *
 * Result: every URL returns HTTP 200 with complete, readable HTML, even without JavaScript.
 * React then takes over in the browser (createRoot replaces the static markup).
 *
 * Chrome: set CHROME_PATH, or a standard install location is used.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = process.env.SITE_URL ?? 'https://aayushsinghthapa-cloud.github.io/grantly';

const STATIC_ROUTES = {
  '/': 'Find the scholarships you qualify for, understand every rule in plain words, apply with a roadmap and track every deadline. One profile, every scholarship explained.',
  '/onboarding':
    'Build your eligibility profile in four short steps and see every scholarship you qualify for.',
  '/discover':
    'Search and filter 30 scholarships, each scored against your profile with a match score and plain-language reasons.',
  '/dashboard':
    'Your funding gap, upcoming deadlines and the applications that need action this week.',
  '/tracker':
    'Track every application from saved to submitted to won, with drag-and-drop and a keyboard-friendly menu.',
  '/vault':
    'Mark the documents you already have once. Every application shows what is ready, missing or expired.',
  '/compare':
    'Compare up to three scholarships side by side, with differences highlighted and the best value marked.',
  '/profile': 'Edit your eligibility profile, choose a theme, and manage your data.',
};

const scholarshipIds = [
  ...readFileSync(join(root, 'src/data/scholarships.ts'), 'utf8').matchAll(
    /^ {4}id: '([a-z0-9-]+)'/gm,
  ),
].map((m) => m[1]);
const routes = [...Object.keys(STATIC_ROUTES), ...scholarshipIds.map((id) => `/scholarship/${id}`)];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH.');
  return found;
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const template = readFileSync(join(dist, 'index.html'), 'utf8');
// Unknown URLs still need the app shell (it renders the 404 page), so keep the bare template as 404.html.
writeFileSync(join(dist, '404.html'), template);

const server = await preview({ preview: { port: 4321, strictPort: false }, logLevel: 'error' });
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ['--no-sandbox'],
});

let failures = 0;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('main h1', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 400)); // let reduced-motion transitions settle
    const { html, title, summary } = await page.evaluate(() => ({
      html: document.getElementById('root').innerHTML,
      title: document.title,
      summary: document.querySelector('main h1 + p, main h1 ~ p')?.textContent?.trim() ?? '',
    }));
    const description = STATIC_ROUTES[route] ?? summary;
    const canonical = `${SITE}${route === '/' ? '/' : route}`;

    const out = template
      .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeText(title)}</title>`)
      .replace(
        /<meta\s+name="description"[^>]*>/,
        () => `<meta name="description" content="${escapeAttr(description)}" />`,
      )
      .replace(
        /<meta\s+property="og:title"[^>]*>/,
        () => `<meta property="og:title" content="${escapeAttr(title)}" />`,
      )
      .replace('</head>', () => `    <link rel="canonical" href="${canonical}" />\n  </head>`)
      .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);

    if (!out.includes(html.slice(0, 40))) {
      failures += 1;
      console.error(`✗ ${route}: could not inject rendered markup`);
      continue;
    }
    const file =
      route === '/' ? join(dist, 'index.html') : join(dist, route.slice(1), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, out);
    console.log(`✓ ${route.padEnd(44)} ${(out.length / 1024).toFixed(0).padStart(4)} KB  ${title}`);
  }
} finally {
  await browser.close();
  await server.close();
}

// Discoverability: sitemap + robots.
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `  <url><loc>${SITE}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`\nPre-rendered ${routes.length - failures}/${routes.length} routes.`);
if (failures) process.exit(1);
