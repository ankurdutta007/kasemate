const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  
  // Desktop
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // 1. Tracks loop test
  await page.evaluate(() => {
    const el = document.getElementById('tracks');
    if (el) {
      window.scrollTo(0, el.offsetTop);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click left arrow (it should wrap to the last card)
  await page.evaluate(() => {
    const leftBtn = document.querySelector('.lv2-carousel-arrows button:first-child');
    if (leftBtn) leftBtn.click();
  });
  
  // Wait for scroll animation to settle
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/tracks_loop.png' });

  // 2. Cases text test
  await page.evaluate(() => {
    const el = document.getElementById('cases');
    if (el) {
      window.scrollTo(0, el.offsetTop + el.offsetHeight - window.innerHeight);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/cases_fixed.png' });

  await browser.close();
})();
