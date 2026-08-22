const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/navbar-updated.png`,
    clip: { x: 0, y: 0, width: 1440, height: 100 }
  });

  await browser.close();
})();
