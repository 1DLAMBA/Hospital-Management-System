// Captures a transparent-background HTML page to PNG frames with true alpha,
// using page.emulateMedia + omitBackground so it can be composited over
// footage in ffmpeg rather than flattened onto an opaque canvas.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PAGE = process.env.PAGE;
const OUT = process.env.FRAMES || 'frames';
const FPS = Number(process.env.FPS || 30);
const DURATION = Number(process.env.DURATION || 8);

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
      omitBackground: true,
      animations: 'disabled',
    });
  }

  await browser.close();
  console.log(`captured ${total} alpha frames @ ${FPS}fps (${DURATION}s)`);
})();
