const { chromium } = require('playwright');
const path = require('path');

const PAGES = ['ad-real-app.html', 'ad-real-phone.html'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const file of PAGES) {
    await page.goto('file://' + path.resolve(__dirname, file), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const out = path.join(__dirname, 'processed', file.replace('.html', '.png'));
    await page.screenshot({ path: out });
    console.log('rendered', out);
  }
  await browser.close();
})();
