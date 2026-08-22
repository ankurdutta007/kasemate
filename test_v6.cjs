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

  for (let i = 0; i < 4; i++) {
    await page.screenshot({ 
      path: `/Users/ankurdutta/Downloads/code/tracks_smooth_comet_full_${i}.png`
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();
})();
