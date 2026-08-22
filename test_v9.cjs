const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);

  // Take screenshot as soon as possible after layout
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_immediate_0.png`
  });

  await browser.close();
})();
