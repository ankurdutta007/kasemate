const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // scroll to proof (to see full color logos and colored text)
  await page.evaluate(() => {
    const section = document.getElementById('proof');
    window.scrollTo(0, section.offsetTop + 150); // scroll deeper to see the bottom of it clearly
  });
  
  await new Promise(r => setTimeout(r, 2000)); // wait for fade
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/proof_final.png' });
  
  // scroll to footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/footer_final.png' });
  
  await browser.close();
})();
