const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  
  // Scroll so Tracks header is clearly in view
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 200);
  await new Promise(r => setTimeout(r, 600)); // wait for layout
  
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_overlay_fixed.png` });

  // Click 3rd card directly
  const cards = await page.$$('.lv2-card');
  await cards[2].click();
  await new Promise(r => setTimeout(r, 1000));
  
  // Take screenshot of the carousel area to prove no blue outline
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop);
  await new Promise(r => setTimeout(r, 600)); // wait for layout
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_carousel_no_outline.png` });

  await browser.close();
})();
