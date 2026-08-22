const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const turnHeight = await page.evaluate(() => document.getElementById('the-turn').getBoundingClientRect().height);
  
  // scroll past TurnV2 so TracksV2's heading is visible in the top half
  // TurnV2 bottom is at turnTop + turnHeight.
  const scrollPos = turnTop + turnHeight - 400; 
  
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
  await new Promise(r => setTimeout(r, 800)); 
  
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_fixed_overlap.png` });

  await browser.close();
})();
