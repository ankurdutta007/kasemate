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

  // Full screenshot for background verification
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_bg_v3_full.png`
  });

  const getActiveCardBox = async () => {
    return await page.evaluate(() => {
      const active = document.querySelector('.lv2-card[data-active="true"]');
      if (!active) return null;
      const rect = active.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    });
  };

  // Click 1 (Right arrow -> index 1)
  const rightArrow = await page.$('.lv2-carousel-arrows button:nth-child(2)');
  await rightArrow.click();
  // Wait just enough for React to render and the stroke to appear (it starts immediately)
  // Give it a tiny bit of time (like 100ms)
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_comet_restart_1.png`,
    clip: await getActiveCardBox()
  });

  // Wait 2 seconds so the animation drifts away from the center
  await new Promise(r => setTimeout(r, 2000));

  // Click 2 (Left arrow -> index 0)
  const leftArrow = await page.$('.lv2-carousel-arrows button:nth-child(1)');
  await leftArrow.click();
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_comet_restart_2.png`,
    clip: await getActiveCardBox()
  });

  // Wait 2 seconds so it drifts
  await new Promise(r => setTimeout(r, 2000));

  // Click 3 (Direct click -> index 2)
  const cards = await page.$$('.lv2-card');
  await cards[2].click();
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/tracks_comet_restart_3.png`,
    clip: await getActiveCardBox()
  });

  await browser.close();
})();
