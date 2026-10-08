/**
 * Screenshots real, public (unauthenticated) Phoenix pages at a phone
 * viewport for use as genuine product screenshots in ad creative —
 * as opposed to the illustrated/mocked UI used elsewhere in ad-creatives/.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:4800';
const OUT = path.join(__dirname, 'raw');

const PAGES = [
  { route: '/', name: 'landing' },
  { route: '/consult', name: 'consult' },
  { route: '/practice', name: 'practice' },
  { route: '/services', name: 'services' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  for (const { route, name } of PAGES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${name}-viewport.png`) });
    await page.screenshot({ path: path.join(OUT, `${name}-full.png`), fullPage: true });
    console.log(`captured ${name}`);
  }

  await browser.close();
})();
