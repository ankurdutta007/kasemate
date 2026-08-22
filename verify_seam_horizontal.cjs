const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  // scroll directly to the Interview section so it triggers ScrollReveal
  await page.evaluate(() => {
    const section = document.getElementById('interview');
    window.scrollTo(0, section.offsetTop - 300);
    setTimeout(() => {
      window.scrollTo(0, section.offsetTop + 100);
    }, 500);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const clipBox = await page.evaluate(() => {
    const section = document.getElementById('interview');
    const picture = section.querySelector('picture');
    const container = picture.parentElement;
    const rect = container.getBoundingClientRect();
    // we want a box crossing the left edge
    return {
      x: Math.floor(rect.x) - 50,
      y: Math.floor(rect.y) + Math.floor(rect.height / 2),
      width: 100, // 50px outside, 50px inside on the left
      height: 100,
    };
  });

  const b64 = await page.screenshot({ encoding: 'base64', clip: clipBox });
  
  const analyzePage = await browser.newPage();
  const result = await analyzePage.evaluate(async (base64Str, width, height) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + base64Str;
    await new Promise(r => img.onload = r);
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, width, height).data;
    
    const getLuminance = (x, y) => {
      const idx = (y * width + x) * 4;
      return 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    };
    
    let maxStep = 0;
    let sumStep = 0;
    let rowsChecked = 0;
    
    for (let y = 0; y < height; y += 10) {
      let rowMaxStep = 0;
      for (let x = 1; x < width; x++) {
        const step = Math.abs(getLuminance(x, y) - getLuminance(x - 1, y));
        if (step > rowMaxStep) rowMaxStep = step;
      }
      if (rowMaxStep > maxStep) maxStep = rowMaxStep;
      sumStep += rowMaxStep;
      rowsChecked++;
    }
    
    return { meanStep: sumStep / rowsChecked, maxStep };
  }, b64, clipBox.width, clipBox.height);
  
  console.log(`Mean step: ${result.meanStep.toFixed(2)}`);
  console.log(`Max step: ${result.maxStep.toFixed(2)}`);
  
  if (result.meanStep < 5 && result.maxStep < 10) {
    console.log("HORIZONTAL SEAM VERIFICATION PASSED");
  } else {
    console.log("HORIZONTAL SEAM VERIFICATION FAILED");
  }

  await browser.close();
})();
