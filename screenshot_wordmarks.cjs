const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  
  const pageNav = await browser.newPage();
  await pageNav.setViewport({ width: 1440, height: 900 });
  await pageNav.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  // Crop to top-left area for nav
  await pageNav.screenshot({
    path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/wordmark-nav.png',
    clip: { x: 0, y: 0, width: 400, height: 100 }
  });

  const pageAuth = await browser.newPage();
  await pageAuth.setViewport({ width: 1440, height: 900 });
  await pageAuth.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  
  // Crop to top-left area of auth panel (or the exact element)
  const authLogo = await pageAuth.$('div[title="Back to home"]');
  if (authLogo) {
    await authLogo.screenshot({
      path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/wordmark-auth.png'
    });
  } else {
    await pageAuth.screenshot({
      path: '/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/wordmark-auth.png',
      clip: { x: 0, y: 0, width: 400, height: 100 }
    });
  }

  await browser.close();
})();
