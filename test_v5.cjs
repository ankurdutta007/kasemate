const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);
  await new Promise(r => setTimeout(r, 600)); // wait for layout

  const getActiveIndex = async () => {
    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.lv2-card'));
      return cards.findIndex(c => c.getAttribute('data-active') === 'true');
    });
  };

  console.log('Initial active index:', await getActiveIndex());

  const rightArrow = await page.$('.lv2-carousel-arrows button:nth-child(2)');
  if (rightArrow) {
    await rightArrow.click();
    await new Promise(r => setTimeout(r, 600));
    console.log('Active index after clicking right arrow:', await getActiveIndex());
  }

  const leftArrow = await page.$('.lv2-carousel-arrows button:nth-child(1)');
  if (leftArrow) {
    await leftArrow.click();
    await new Promise(r => setTimeout(r, 600));
    console.log('Active index after clicking left arrow:', await getActiveIndex());
  }

  const cards = await page.$$('.lv2-card');
  if (cards.length > 2) {
    await cards[2].click();
    await new Promise(r => setTimeout(r, 600));
    console.log('Active index after clicking 3rd card directly:', await getActiveIndex());
  }

  // Get active card coordinates for capturing comet
  const cardBox = await page.evaluate(() => {
    const active = document.querySelector('.lv2-card[data-active="true"]');
    if (!active) return null;
    const rect = active.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  });

  if (cardBox) {
    console.log("Capturing smooth animation sequence...");
    for (let i = 0; i < 4; i++) {
      await page.screenshot({ 
        path: `/Users/ankurdutta/Downloads/code/tracks_smooth_comet_anim_${i}.png`,
        clip: cardBox
      });
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  await browser.close();
})();
