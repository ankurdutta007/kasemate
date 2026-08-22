const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const widths = [1280, 1440, 1920, 2560];
  
  for (const w of widths) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    
    const dims = await page.evaluate(() => {
      const h1 = document.querySelector('h1.lv2-display');
      if (!h1) return null;
      const computedStyle = window.getComputedStyle(h1);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const actualHeight = h1.getBoundingClientRect().height;
      
      const subhead = h1.nextElementSibling;
      const subheadTop = subhead ? subhead.getBoundingClientRect().top : 0;
      const h1Bottom = h1.getBoundingClientRect().bottom;
      
      return {
        lines: Math.round(actualHeight / lineHeight),
        height: actualHeight,
        overlap: h1Bottom > subheadTop,
        gap: subheadTop - h1Bottom
      };
    });
    console.log(`At ${w}px:`, dims);
  }
  
  await browser.close();
})();
