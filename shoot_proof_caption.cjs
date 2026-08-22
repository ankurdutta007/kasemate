const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const section = document.getElementById('proof');
    window.scrollTo(0, section.offsetTop + 150);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/proof_caption.png' });
  
  await browser.close();
})();
