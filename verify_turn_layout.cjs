const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const turnHeight = await page.evaluate(() => document.getElementById('the-turn').getBoundingClientRect().height);
  const viewportHeight = 900;
  const runwayLength = turnHeight - viewportHeight;
  
  const checkpoints = [0.25, 0.50, 0.75];
  
  for (let i = 0; i < checkpoints.length; i++) {
    const fraction = checkpoints[i];
    const scrollPos = turnTop + (runwayLength * fraction);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
    await new Promise(r => setTimeout(r, 600)); // wait for layout/animations
    await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_layout_${fraction * 100}.png` });
  }

  await browser.close();
})();
