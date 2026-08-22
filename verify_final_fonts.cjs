const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  
  // 1. Check network for Libre Baskerville
  const page = await browser.newPage();
  let fontRequested = false;
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('Libre') && url.includes('fonts.gstatic.com')) {
      fontRequested = true;
      console.log('Font loaded:', url);
    }
  });
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  if (!fontRequested) {
    console.log('WARNING: Libre Baskerville font file was NOT requested by the browser.');
  } else {
    console.log('SUCCESS: Libre Baskerville font file was requested.');
  }
  
  // scroll to roadmap to see 57
  await page.evaluate(() => {
    const section = document.getElementById('roadmap');
    window.scrollTo(0, section.offsetTop);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/roadmap_57_poppins.png' });
  
  // scroll to cases to see 271
  await page.evaluate(() => {
    const section = document.getElementById('cases');
    window.scrollTo(0, section.offsetTop);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/cases_271_poppins.png' });

  await browser.close();
})();
