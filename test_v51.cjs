const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file:///Users/ankurdutta/Downloads/code/test_v51.html');
  const size = await page.evaluate(() => {
    const el = document.querySelector('.lv2-dot');
    return el.getBoundingClientRect();
  });
  console.log(size);
  await browser.close();
})();
