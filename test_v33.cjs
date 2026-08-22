const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to the bottom to see Closing section
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/closing-bg-revert.png`
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await browser.close();
})();
