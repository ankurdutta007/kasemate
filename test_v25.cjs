const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const casesTop = await page.evaluate(() => document.getElementById('cases').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), casesTop);

  await new Promise(r => setTimeout(r, 500));

  // Take screenshot of the full section
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/cases_bg_mask_full.png`
  });

  // Take zoomed screenshot of the top edge
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/cases_bg_mask_top.png`,
    clip: { x: 0, y: casesTop - 100, width: 1440, height: 300 }
  });

  // Get bottom position and take zoomed screenshot of the bottom edge
  const casesBottom = await page.evaluate(() => {
    const el = document.getElementById('cases');
    return el.offsetTop + el.offsetHeight;
  });
  
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/cases_bg_mask_bottom.png`,
    clip: { x: 0, y: casesBottom - 200, width: 1440, height: 300 }
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await browser.close();
})();
