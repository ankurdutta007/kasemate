const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);

  // Take screenshot
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_heading_colors.png`
  });

  // Verify there are no console errors in the browser? (not strictly required if we just check terminal output, but good practice)
  await browser.close();
})();
