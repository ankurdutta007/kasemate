const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const checkWidth = async (width) => {
    await page.setViewport({ width, height: 900 });
    await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    
    return await page.evaluate((w) => {
      let issues = [];
      
      // Check horizontal overflow
      const docW = document.documentElement.scrollWidth;
      if (docW > w) {
        issues.push(`Horizontal overflow detected: doc is ${docW}px, viewport is ${w}px`);
        document.querySelectorAll('*').forEach(el => {
          if (el.scrollWidth > w) issues.push(`Overflowing element: ${el.tagName}.${el.className}`);
        });
      }
      
      // Check Nav behavior
      const navDesktop = document.querySelector('.lv2-nav-desktop');
      const navBurger = document.querySelector('.lv2-nav-burger');
      const dDisplay = navDesktop ? window.getComputedStyle(navDesktop).display : 'none';
      const bDisplay = navBurger ? window.getComputedStyle(navBurger).display : 'none';
      issues.push(`Nav at ${w}px: desktop display=${dDisplay}, burger display=${bDisplay}`);
      
      // Tap target check (simple heuristic)
      const buttons = document.querySelectorAll('button, a, .lv2-nav-link');
      let smallTargets = 0;
      buttons.forEach(b => {
        const rect = b.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
           // allow logo to be small, otherwise flag
           if (!b.href?.includes('#top')) smallTargets++;
        }
      });
      if (smallTargets > 0) issues.push(`${smallTargets} interactive elements are smaller than 44x44px`);
      
      return issues;
    }, width);
  };

  const results = {};
  results['375'] = await checkWidth(375);
  results['768'] = await checkWidth(768);
  
  // For 390, we take screenshots of each section
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  results['390'] = await page.evaluate((w) => {
      let issues = [];
      const docW = document.documentElement.scrollWidth;
      if (docW > w) issues.push(`Horizontal overflow detected: doc is ${docW}px, viewport is ${w}px`);
      return issues;
  }, 390);

  const sections = ['top', 'tracks', 'roadmap', 'cases', 'proof', 'interview', 'the-turn', 'closing'];
  for (const s of sections) {
    try {
      const el = await page.$(`#${s}`);
      if (el) {
        await page.evaluate(id => {
          const element = document.getElementById(id);
          element.scrollIntoView({ block: 'start' });
        }, s);
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/mobile-${s}.png`, clip: { x: 0, y: await page.evaluate(id => document.getElementById(id).getBoundingClientRect().top + window.scrollY), width: 390, height: await page.evaluate(id => document.getElementById(id).getBoundingClientRect().height) } });
      }
    } catch(e) {
      console.log(`Failed screenshot for ${s}:`, e);
    }
  }

  // take screenshot of navbar specifically at 390px
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/mobile-nav.png`, clip: { x: 0, y: 0, width: 390, height: 100 } });

  fs.writeFileSync('mobile-results.json', JSON.stringify(results, null, 2));

  await browser.close();
})();
