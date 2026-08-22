const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const casesTop = await page.evaluate(() => document.getElementById('cases').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), casesTop);

  await new Promise(r => setTimeout(r, 500));

  // Take screenshot
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/cases_glow.png`
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await browser.close();
})();
