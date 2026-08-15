const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for standard 1080p width
  await page.setViewport({ width: 1200, height: 900 });

  // Navigate to Practice Hub (Random Tab)
  await page.goto('http://localhost:8444/practice');
  // Wait for network idle or 2 seconds
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/5687fcec-f864-433f-9168-bf5fdc8f74fa/.user_uploaded/hub_random_screenshot.png' });

  // Navigate to Choose a Track (Browse Tab)
  await page.goto('http://localhost:8444/practice?tab=browse');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/5687fcec-f864-433f-9168-bf5fdc8f74fa/.user_uploaded/hub_browse_screenshot.png' });

  await browser.close();
})();
