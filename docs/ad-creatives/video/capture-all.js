const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const JOBS = [
  ['anim-FactSocial',     'phoenix-social-story',      7.8],
  ['anim-FactPhysio',     'phoenix-physio-story',      7.8],
  ['anim-FactPharmacist', 'phoenix-pharmacy-story',    7.8],
  ['anim-ValueQuestions', 'phoenix-questions-story',   8.0],
  ['anim-ValueEmergency', 'phoenix-difference-story',  8.0],
  ['anim-Assistant',      'phoenix-which-doctor-story',7.6],
];
const FPS = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });

  for (const [src, out, dur] of JOBS) {
    const dir = 'frames_' + out;
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    await page.goto('file://' + path.resolve(src + '.html'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);

    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / FPS);
      await page.screenshot({ path: path.join(dir, String(i).padStart(5, '0') + '.png'), animations: 'disabled' });
    }
    console.log('captured ' + out + ' (' + total + ' frames)');
  }
  await browser.close();
})();
