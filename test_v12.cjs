const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .lv2-carousel { scroll-behavior: auto !important; }
    `;
    document.head.appendChild(style);
  });

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);

  // Click Right Arrow
  const rightArrow = await page.$('.lv2-carousel-arrows button:nth-child(2)');
  await rightArrow.click();
  await new Promise(r => setTimeout(r, 50));
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_restart_click1.png` });

  await new Promise(r => setTimeout(r, 1000)); // wait a bit

  // Click 3rd Card
  const cards = await page.$$('.lv2-card');
  await cards[2].click();
  await new Promise(r => setTimeout(r, 50));
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_restart_click2.png` });

  await browser.close();
})();
