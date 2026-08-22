const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  const interviewTop = await page.evaluate(() => document.getElementById('interview').offsetTop);
  await page.evaluate((pos) => window.scrollTo(0, pos + 200), interviewTop);

  await new Promise(r => setTimeout(r, 1500));

  // Take screenshot of all badges
  await page.screenshot({ 
    path: `/Users/ankurdutta/Downloads/code/interview_solid_tags3.png`
  });

  // Take zoomed screenshot of the first badge
  const badges = await page.$$('div[style*="border: 2px solid rgba(255, 255, 255, 0.95)"]');
  if (badges.length > 0) {
    await badges[0].screenshot({ 
      path: `/Users/ankurdutta/Downloads/code/interview_tag_zoomed.png`
    });
  }

  await browser.close();
})();
