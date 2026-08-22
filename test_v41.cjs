const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const scrollInfo = await page.evaluate(() => {
    return {
      bodyOverflowY: window.getComputedStyle(document.body).overflowY,
      htmlOverflowY: window.getComputedStyle(document.documentElement).overflowY,
      wrapperMinHeight: document.querySelector('.auth-wrapper') ? document.querySelector('.auth-wrapper').style.minHeight : null
    };
  });
  
  console.log(JSON.stringify(scrollInfo, null, 2));

  await browser.close();
})();
