const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // screenshot of Tracks section
  await page.evaluate(() => {
    const section = document.getElementById('tracks');
    window.scrollTo(0, section.offsetTop);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/tracks_desc.png' });
  
  // full page screenshot for flow
  // we can just use fullPage: true and it will capture everything
  // but to make sure lazy loading works, let's scroll down to bottom first
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  
  // actually, let's just screenshot from Roadmap down to Closing to save space, or just fullPage.
  // Full page is easiest.
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/full_flow.png', fullPage: true });

  await browser.close();
})();
