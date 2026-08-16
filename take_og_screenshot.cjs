const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // standard Open Graph dimensions
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  // wait until network is mostly idle to ensure fonts/images load
  await page.goto('http://localhost:8443/', { waitUntil: 'networkidle0' });
  
  // Extra wait for any reveal animations (Reveal component uses framer-motion or similar)
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ 
    path: '/Users/ankurdutta/Downloads/code/public/og-image.png',
    clip: { x: 0, y: 0, width: 1200, height: 630 } // Exactly 1200x630 crop of the top section
  });

  await browser.close();
})();
