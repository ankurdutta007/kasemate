const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Tall viewport to capture Hero fade out and Tracks glow at once
  await page.setViewport({ width: 1440, height: 1200 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  
  // Scroll so Tracks header is in the middle of the screen
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 400);
  await new Promise(r => setTimeout(r, 600)); // wait for layout
  
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_glow.png` });

  await browser.close();
})();
