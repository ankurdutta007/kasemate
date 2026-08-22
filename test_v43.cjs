const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Full page height
  const height = await page.evaluate(() => document.body.scrollHeight);
  
  // Take screenshots every 844px down
  for (let y = 0; y < height; y += 844) {
    const h = Math.min(844, height - y);
    if (h > 0) {
      await page.evaluate((scroll_y) => window.scrollTo(0, scroll_y), y);
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/mobile-part-${Math.floor(y/844)}.png`, clip: { x: 0, y: y, width: 390, height: h } });
    }
  }

  await browser.close();
})();
