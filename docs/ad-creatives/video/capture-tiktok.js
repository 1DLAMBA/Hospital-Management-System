const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const JOBS = [
  ['tiktok-consult-list',  12.8],
  ['tiktok-ot',            13.5],
  ['tiktok-clinic-closed', 13.3],
  ['tiktok-quiz',          13.6],
];
const FPS = 30;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [src, dur] of JOBS) {
    const dir = 'f_' + src;
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    await page.goto('file://' + path.resolve(src + '.html'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / FPS);
      await page.screenshot({ path: path.join(dir, String(i).padStart(5,'0') + '.png'), animations: 'disabled' });
    }
    console.log('captured ' + src + ' (' + total + ')');
  }
  await browser.close();
})();
