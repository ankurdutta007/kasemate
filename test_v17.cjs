const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const interviewTop = await page.evaluate(() => document.getElementById('interview').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos), interviewTop);

  // Take screenshot
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/interview_tags.png`
  });

  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await browser.close();
})();
