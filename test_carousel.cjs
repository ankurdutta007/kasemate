const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  async function getActiveIndex() {
    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.lv2-card'));
      return cards.findIndex(c => c.getAttribute('data-active') === 'true');
    });
  }

  const initial = await getActiveIndex();
  console.log('Initial active index:', initial);

  // Click right arrow
  const arrows = await page.$$('.lv2-carousel-btn');
  await arrows[1].click(); // right arrow
  await new Promise(r => setTimeout(r, 1000)); // wait for scroll animation
  const afterRight = await getActiveIndex();
  console.log('Active index after clicking right arrow:', afterRight);

  // Click left arrow
  await arrows[0].click(); // left arrow
  await new Promise(r => setTimeout(r, 1000));
  const afterLeft = await getActiveIndex();
  console.log('Active index after clicking left arrow:', afterLeft);

  // Click 3rd card directly
  const cards = await page.$$('.lv2-card');
  await cards[2].click();
  await new Promise(r => setTimeout(r, 1000));
  const afterCardClick = await getActiveIndex();
  console.log('Active index after clicking 3rd card directly:', afterCardClick);

  await browser.close();
})();
