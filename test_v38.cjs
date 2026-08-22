const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/hero-updated.png`
  });

  // Verify anchor links scroll to right section by checking bounding box
  const checkLink = async (selector, targetId) => {
    await page.click(selector);
    await new Promise(r => setTimeout(r, 1000)); // wait for scroll
    const box = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return rect.top; // Should be near 0 if scrolled there
    }, targetId);
    console.log(`Link ${selector} scrolled to ${targetId}, top is ${box}`);
  };

  // The links don't have special ids but we can click them by href
  await checkLink('a[href="#tracks"]', 'tracks');
  await checkLink('a[href="#roadmap"]', 'roadmap');
  await checkLink('a[href="#proof"]', 'proof');

  await browser.close();
})();
