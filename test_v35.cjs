const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 2500, height: 1200 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Find the tracks section and scroll to it
  await page.evaluate(() => {
    const el = document.getElementById('tracks');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks-cards-side-by-side-v3.png`
  });

  await browser.close();
})();
