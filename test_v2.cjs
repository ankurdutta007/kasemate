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
  
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_bg_v2_full.png` });

  // Zoomed in on bottom edge of background layer (which is 400px tall)
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_bg_v2_bottom_edge.png`,
    clip: { x: 200, y: tracksTop + 300, width: 1040, height: 200 }
  });

  // Check carousel quickly
  const cards = await page.$$('.lv2-card');
  await cards[1].click(); // Product track
  await new Promise(r => setTimeout(r, 500));
  const activeIndex = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.lv2-card'));
    return cards.findIndex(c => c.getAttribute('data-active') === 'true');
  });
  console.log('Active index after quick click test:', activeIndex);

  await browser.close();
})();
