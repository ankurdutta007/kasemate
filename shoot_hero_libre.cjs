const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/hero_libre_1440.png' });
  
  await browser.close();
})();
