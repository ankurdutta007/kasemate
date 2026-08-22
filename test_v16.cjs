const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);

  // Take screenshot of all 4 cards
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_colors_all.png`
  });

  // Scroll carousel to the last card (General Management)
  await page.evaluate(() => {
    const carousel = document.querySelector('.lv2-carousel');
    const cards = document.querySelectorAll('.lv2-card');
    if (carousel && cards.length >= 4) {
      carousel.scrollTo({ left: cards[3].offsetLeft - carousel.offsetLeft, behavior: 'instant' });
    }
  });

  // Wait a moment for layout
  await new Promise(r => setTimeout(r, 100));

  // Take zoomed screenshot of the 4th card
  const cardElement = await page.$$('.lv2-card');
  if (cardElement.length >= 4) {
    await cardElement[3].screenshot({ 
      path: `/Users/ankurdutta/Downloads/code/tracks_gm_zoomed.png`
    });
  }

  await browser.close();
})();
