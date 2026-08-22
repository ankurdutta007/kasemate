const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });

  const targets = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('a, button, [role="button"], input, select'));
    const smallTargets = [];

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < 44 || rect.height < 44) {
          smallTargets.push({
            tag: el.tagName,
            text: el.innerText.trim().substring(0, 20),
            id: el.id,
            href: el.getAttribute('href'),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            className: el.className
          });
        }
      }
    }
    return smallTargets;
  });

  console.log(JSON.stringify(targets, null, 2));
  await browser.close();
})();
