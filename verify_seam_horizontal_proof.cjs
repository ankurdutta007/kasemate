const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const section = document.getElementById('proof');
    window.scrollTo(0, section.offsetTop + 150);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Take screenshot of the whole section
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/proof_horizontal_seam.png' });
  
  // Test left seam
  const clipBox = await page.evaluate(() => {
    const section = document.getElementById('proof');
    // finding the marquee container by looking at the second div child (the one with the marquee)
    const marquee = section.children[1]; 
    const rect = marquee.getBoundingClientRect();
    return {
      x: 0,
      y: Math.floor(rect.y),
      width: 100, // checking the left edge
      height: Math.floor(rect.height),
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

  // screenshot of closing
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/closing_simplified.png' });

  await browser.close();
})();
