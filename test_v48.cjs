const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/auth', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const styles = await page.evaluate(() => {
    const el = document.querySelector('.auth-wrapper');
    const comp = window.getComputedStyle(el);
    return {
      className: el.className,
      backgroundColor: comp.backgroundColor,
      hasLv2Root: el.classList.contains('lv2-root'),
      lv2BgValue: comp.getPropertyValue('--lv2-bg')
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));

  await browser.close();
})();
