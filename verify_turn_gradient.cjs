const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser console error:', msg.text());
  });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const viewportHeight = 900;
  
  // Three points: 1) Top of transition in view, 2) Middle of transition, 3) Bottom of transition going into tracks
  const points = [turnTop - 450, turnTop - 200, turnTop + 100];
  
  for (let i = 0; i < points.length; i++) {
    await page.evaluate((pos) => window.scrollTo(0, pos), points[i]);
    await new Promise(r => setTimeout(r, 600)); // wait for layout
    await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_gradient_${i}.png` });
  }

  await browser.close();
  console.log('done');
})();
