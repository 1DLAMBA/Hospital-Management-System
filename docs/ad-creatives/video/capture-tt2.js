const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const D = JSON.parse(fs.readFileSync('_tt2.json', 'utf8'));
const FPS = 30;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [src, dur] of Object.entries(D)) {
    const dir = 'g_' + src;
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    await page.goto('file://' + path.resolve(src + '.html'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(750);
    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / FPS);
      await page.screenshot({ path: path.join(dir, String(i).padStart(5,'0') + '.png'), animations: 'disabled' });
    }
    console.log('captured ' + src + ' (' + total + ')');
  }
  await browser.close();
})();
