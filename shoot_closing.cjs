const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // scroll to proof
  await page.evaluate(() => {
    const section = document.getElementById('proof');
    window.scrollTo(0, section.offsetTop - 50);
  });
  
  await new Promise(r => setTimeout(r, 3000)); // wait for countup
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/proof_rest.png' });
  
  // scroll away and back
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const section = document.getElementById('proof');
    window.scrollTo(0, section.offsetTop - 50);
  });
  await new Promise(r => setTimeout(r, 1000)); // Should already be final value
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/proof_second_scroll.png' });
  
  // scroll to closing
  await page.evaluate(() => {
    const section = document.getElementById('closing');
    window.scrollTo(0, section.offsetTop);
  });
  
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/closing_rest.png' });
  
  await browser.close();
})();
