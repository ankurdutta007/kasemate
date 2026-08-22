const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);
  
  // Wait for 1st card to be fully active
  await page.waitForFunction(() => {
    const card = document.querySelectorAll('.lv2-card')[0];
    return card && card.getAttribute('data-active') === 'true';
  });

  // Click 2nd card
  const cards = await page.$$('.lv2-card');
  await cards[1].click();

  // Wait for 2nd card to become active
  await page.waitForFunction(() => {
    const card = document.querySelectorAll('.lv2-card')[1];
    return card && card.getAttribute('data-active') === 'true';
  });

  // Screenshot instantly
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_top_center_restart.png` });

  await browser.close();
})();
