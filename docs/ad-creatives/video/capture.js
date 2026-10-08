/**
 * Steps a deterministic renderFrame(t) timeline and writes one PNG per frame.
 * Frame-stepping (rather than recording wall-clock) keeps timing exact and
 * output free of dropped or duplicated frames.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PAGE = process.env.PAGE || 'story-consult.html';
const OUT = process.env.FRAMES || 'frames';
const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 7.6);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  await page.goto('file://' + path.resolve(PAGE), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const total = Math.round(DURATION * FPS);
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.renderFrame(tt), t);
    await page.screenshot({
      path: path.join(OUT, String(i).padStart(5, '0') + '.png'),
      animations: 'disabled',
    });
  }

  await browser.close();
  console.log(`captured ${total} frames @ ${FPS}fps (${DURATION}s)`);
})();
