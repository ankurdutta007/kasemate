const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1800 }); // Large viewport to capture sequence
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // scroll to InterviewV2 to trigger animations
  await page.evaluate(() => {
    const section = document.getElementById('interview');
    window.scrollTo(0, section.offsetTop);
  });
  await new Promise(r => setTimeout(r, 1500));
  
  // screenshot the sequence
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/interview_stats_closing.png' });
  
  // scroll all the way to bottom to show closing attribution
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/closing_attribution_lower.png' });

  await browser.close();
})();
