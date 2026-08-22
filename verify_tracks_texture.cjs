const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const tracksTop = await page.evaluate(() => document.getElementById('tracks').offsetTop);
  
  // Scroll so Tracks header is clearly in view
  await page.evaluate((pos) => window.scrollTo(0, pos), tracksTop - 200);
  await new Promise(r => setTimeout(r, 600)); // wait for layout
  
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/tracks_texture_full.png` });

  // Crop around the heading for zoomed view
  const rect = await page.evaluate(() => {
    const h2 = document.querySelector('#tracks h2');
    return h2.getBoundingClientRect();
  });
  
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_texture_zoom.png`,
    clip: { x: rect.x - 50, y: rect.y - 50, width: rect.width + 100, height: rect.height + 100 }
  });

  await browser.close();
})();
