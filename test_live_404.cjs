const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/', { waitUntil: 'networkidle0' });
  await browser.close();
})();
