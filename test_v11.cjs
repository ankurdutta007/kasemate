const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .lv2-root .lv2-card-highlight-svg rect {
        animation: none !important;
        stroke-dashoffset: 0 !important;
      }
    `;
    document.head.appendChild(style);
  });

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 50);

  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_offset_0.png`
  });

  await browser.close();
})();
