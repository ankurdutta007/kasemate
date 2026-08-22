const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file:///Users/ankurdutta/Downloads/code/test_v45.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/collage2.png', fullPage: true });
  await browser.close();
})();
