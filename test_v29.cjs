const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot at 0%
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/hero4_0.png`
  });

  // Scroll to 40% of the window height (or a reasonable amount to trigger animation)
  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/hero4_40.png`
  });

  // Scroll to 70%
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/hero4_70.png`
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await browser.close();
})();
