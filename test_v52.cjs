const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });

  const font = await page.evaluate(() => {
    // The wordmark is in a span with text "KaseMate"
    const spans = Array.from(document.querySelectorAll('span'));
    const wordmark = spans.find(s => s.innerText === 'KaseMate');
    if (!wordmark) return 'not found';
    return window.getComputedStyle(wordmark).fontFamily;
  });

  console.log('COMPUTED_FONT:', font);
  await browser.close();
})();
