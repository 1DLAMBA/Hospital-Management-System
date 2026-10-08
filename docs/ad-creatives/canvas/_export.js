const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.dc.html'));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const f of files) {
    await page.goto('file://' + path.resolve(f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(650);
    const name = f.replace('.dc.html', '');
    // measure real content height so a shorter card doesn't get a blank tail
    const h = await page.evaluate(() => {
      const r = document.querySelector('x-dc > div');
      return r ? Math.max(r.scrollHeight, r.clientHeight) : 1920;
    });
    if (h !== 1920) await page.setViewportSize({ width: 1080, height: h });
    await page.screenshot({ path: 'exported/' + name + '.png' });
    if (h !== 1920) await page.setViewportSize({ width: 1080, height: 1920 });
    console.log('exported', name, h + 'px');
  }
  await browser.close();
})();
