const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const scrollInfo = await page.evaluate(() => {
    const docHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const hasScrollbar = docHeight > window.innerHeight;
    
    // Also check what exactly is causing overflow if it exists
    const overflowEls = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollHeight > window.innerHeight) {
        overflowEls.push({
           tag: el.tagName,
           class: el.className,
           height: el.scrollHeight
        });
      }
    });
    
    return {
      docHeight,
      viewportHeight: window.innerHeight,
      hasScrollbar,
      bodyScrollHeight: document.body.scrollHeight,
      htmlScrollHeight: document.documentElement.scrollHeight,
      overflowEls
    };
  });
  
  console.log(JSON.stringify(scrollInfo, null, 2));

  await browser.close();
})();
