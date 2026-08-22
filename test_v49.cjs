const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Add cache bypass
  await page.setCacheEnabled(false);
  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/auth-updated-final.png`
  });

  await browser.close();
})();
