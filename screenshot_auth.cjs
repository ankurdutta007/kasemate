const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'auth-fixes.png' });
  
  // Try to simulate overscroll by scrolling to top then negative
  await page.evaluate(() => {
    document.body.style.transform = 'translateY(100px)'; // simulate visual overscroll
  });
  await page.screenshot({ path: 'auth-overscroll.png' });
  await browser.close();
})();
