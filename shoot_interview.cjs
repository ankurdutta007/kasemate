const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Go to the page
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  // Scroll directly to the Interview section
  await page.evaluate(() => {
    const el = document.getElementById('interview');
    if (el) {
      // scroll to just above to trigger the ScrollReveal
      window.scrollTo(0, el.offsetTop - 300);
      setTimeout(() => {
        window.scrollTo(0, el.offsetTop + 100);
      }, 500);
    }
  });
  
  await new Promise(r => setTimeout(r, 2000)); // wait for entrance animation
  
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/interview_rest.png' });

  await browser.close();
})();
