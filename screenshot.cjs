const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8444/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/5687fcec-f864-433f-9168-bf5fdc8f74fa/performance_coming_soon.png' });

  await browser.close();
})();
