const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Set an ultra-wide viewport to fit all cards side-by-side
  await page.setViewport({ width: 2400, height: 1200 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);
  
  await new Promise(r => setTimeout(r, 1000)); // wait for layout/animations
  
  // Optionally, if the carousel CSS still restricts width, force it to expand:
  await page.evaluate(() => {
    const carousel = document.querySelector('.lv2-carousel');
    if (carousel) {
      carousel.style.maxWidth = '100%';
      carousel.style.overflow = 'visible';
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_all_cards.png` });

  await browser.close();
})();
