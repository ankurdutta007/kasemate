const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  
  // Desktop
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  // Wait a bit for everything to settle
  await new Promise(r => setTimeout(r, 1000));
  
  // Scroll to the roadmap section
  // Mid-scroll
  await page.evaluate(() => {
    const el = document.getElementById('roadmap');
    if (el) {
      window.scrollTo(0, el.offsetTop - 100);
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/desktop_mid.png' });

  // Fully separated (scroll to end of roadmap)
  await page.evaluate(() => {
    const el = document.getElementById('roadmap');
    if (el) {
      // scroll to bottom of the element minus viewport height
      window.scrollTo(0, el.offsetTop + el.offsetHeight - window.innerHeight);
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/desktop_full.png' });

  // Mobile
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Scroll to the roadmap section
  // Mid-scroll
  await mobilePage.evaluate(() => {
    const el = document.getElementById('roadmap');
    if (el) {
      window.scrollTo(0, el.offsetTop - 100);
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await mobilePage.screenshot({ path: '/Users/ankurdutta/Downloads/code/mobile_mid.png' });

  // Fully separated (scroll to end of roadmap)
  await mobilePage.evaluate(() => {
    const el = document.getElementById('roadmap');
    if (el) {
      window.scrollTo(0, el.offsetTop + el.offsetHeight - window.innerHeight);
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await mobilePage.screenshot({ path: '/Users/ankurdutta/Downloads/code/mobile_full.png' });

  await browser.close();
})();
