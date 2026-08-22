const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  
  // 1. Check network for Lora
  const page = await browser.newPage();
  let loraRequested = false;
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('Lora') && url.includes('fonts.gstatic.com')) {
      loraRequested = true;
      console.log('Font loaded:', url);
    }
  });
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  if (!loraRequested) {
    console.log('WARNING: Lora font file was NOT requested by the browser.');
  } else {
    console.log('SUCCESS: Lora font file was requested.');
  }
  
  // Check height of headline to see if it wraps to 3 lines
  const dims = await page.evaluate(() => {
    const h1 = document.querySelector('h1.lv2-display');
    const computedStyle = window.getComputedStyle(h1);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const actualHeight = h1.getBoundingClientRect().height;
    return {
      lines: Math.round(actualHeight / lineHeight),
      height: actualHeight,
      lineHeight
    };
  });
  console.log('Headline dimensions at 1440px:', dims);

  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/hero_lora_1440.png' });
  
  // scroll to tracks
  await page.evaluate(() => {
    const section = document.getElementById('tracks');
    window.scrollTo(0, section.offsetTop);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/tracks_lora.png' });
  
  await browser.close();
})();
