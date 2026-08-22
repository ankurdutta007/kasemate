const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  
  // Scroll so Tracks header is clearly in view
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);
  await new Promise(r => setTimeout(r, 600)); // wait for layout
  
  // Screenshot showing all cards (proving they don't blend with bg)
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_cards_contrast.png` });

  // Get active card coordinates
  const cardBox = await page.evaluate(() => {
    const active = document.querySelector('.lv2-card[data-active="true"]');
    if (!active) return null;
    const rect = active.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  });

  if (cardBox) {
    console.log("Capturing animation sequence...");
    for (let i = 0; i < 4; i++) {
      await page.screenshot({ 
        path: `/Users/ankurdutta/Downloads/code/tracks_comet_anim_${i}.png`,
        clip: cardBox
      });
      await new Promise(r => setTimeout(r, 1500)); // wait 1.5s between shots
    }
  }

  await browser.close();
})();
