const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Navigate to #tracks
  await page.evaluate(() => {
    const el = document.getElementById('tracks');
    if (el) {
      window.scrollTo(0, el.offsetTop);
    }
  });
  
  await new Promise(r => setTimeout(r, 1000)); // wait for scroll & ScrollReveal

  // First card screenshot
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/tracks_first_card.png' });

  // Navigate to last card
  await page.evaluate(() => {
    const dots = document.querySelectorAll('.lv2-dot');
    if (dots.length > 0) {
      dots[dots.length - 1].click(); // click the last dot
    }
  });

  await new Promise(r => setTimeout(r, 1500)); // wait for carousel to scroll to the end
  
  // Last card screenshot
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/tracks_last_card.png' });

  await browser.close();
})();
