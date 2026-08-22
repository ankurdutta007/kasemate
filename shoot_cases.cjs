const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  
  // Desktop
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Mid-scroll
  await page.evaluate(() => {
    const el = document.getElementById('cases');
    if (el) {
      window.scrollTo(0, el.offsetTop - 100);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/cases_mid.png' });

  // Fully scrolled (at rest)
  await page.evaluate(() => {
    const el = document.getElementById('cases');
    if (el) {
      window.scrollTo(0, el.offsetTop + el.offsetHeight - window.innerHeight);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/cases_full.png' });

  await browser.close();
})();
