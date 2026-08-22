const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/', { waitUntil: 'networkidle0' });
  
  // Wait a moment for any lazy loads
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await page.screenshot({ path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/live-landing.png', fullPage: true });

  console.log('CONSOLE ERRORS:', JSON.stringify(errors, null, 2));

  // Check CTA href in ClosingV2
  const closingCtaHref = await page.evaluate(() => {
    const a = document.querySelector('a[href="/auth"]');
    return a ? a.href : null;
  });
  console.log('Closing CTA href:', closingCtaHref);

  await browser.close();
})();
