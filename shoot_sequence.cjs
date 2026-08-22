const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  // Wait for initial load
  await new Promise(r => setTimeout(r, 1000));
  
  // Scroll to just above the cases section so it hasn't triggered yet
  await page.evaluate(() => {
    const el = document.getElementById('cases');
    if (el) {
      // scroll to just before 25% of it is in view
      window.scrollTo(0, el.offsetTop - window.innerHeight + 10);
    }
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Now scroll it completely into view to trigger whileInView
  await page.evaluate(() => {
    const el = document.getElementById('cases');
    if (el) {
      window.scrollTo(0, el.offsetTop + 100);
    }
  });
  
  // Capture screenshots at intervals
  for (let i = 1; i <= 6; i++) {
    await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/sequence_${i}.png` });
    await new Promise(r => setTimeout(r, 100)); // ~100ms gap
  }
  
  await browser.close();
})();
