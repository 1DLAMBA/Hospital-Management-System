/**
 * Renders every .creative element in the given HTML files to a PNG at its exact
 * pixel size. Run: NODE_PATH=<repo>/node_modules node render.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILES = ['patients.html', 'professionals.html'];
const OUT = path.join(__dirname, 'png');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  for (const file of FILES) {
    const full = path.join(__dirname, file);
    if (!fs.existsSync(full)) { console.log('skip (missing) ' + file); continue; }
    await page.goto('file://' + full, { waitUntil: 'networkidle' });
    // Webfonts must be resolved before we rasterise, or headings fall back.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);

    const ids = await page.$$eval('.creative', els => els.map(e => e.id));
    for (const id of ids) {
      const el = await page.$('#' + id);
      const box = await el.boundingBox();
      const out = path.join(OUT, id + '.png');
      await el.screenshot({ path: out });
      console.log(`OK  ${id}  ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
  }

  await browser.close();
})();
