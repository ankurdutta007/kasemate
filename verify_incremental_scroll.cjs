const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const turnHeight = await page.evaluate(() => document.getElementById('the-turn').getBoundingClientRect().height);
  const viewportHeight = 900;
  const runwayLength = turnHeight - viewportHeight;
  
  const stepSize = 100;
  const targetEnd = turnTop + turnHeight;
  
  let currentScroll = turnTop;
  let stepCount = 0;
  
  // Navigate to just before the start of the section
  await page.evaluate((pos) => window.scrollTo(0, pos), currentScroll);
  await new Promise(r => setTimeout(r, 1000));
  
  console.log(`Runway Length: ${runwayLength}px`);
  
  let visibleSteps = 0;
  let hasAppeared = false;
  let hasDisappeared = false;
  
  let screenshotIndex = 0;

  while (currentScroll < targetEnd) {
    currentScroll += stepSize;
    if (currentScroll > targetEnd) currentScroll = targetEnd;
    
    await page.evaluate((pos) => window.scrollTo(0, pos), currentScroll);
    await new Promise(r => setTimeout(r, 150)); // simulate human scroll wait
    stepCount++;
    
    // Evaluate if image is visible
    const isVisible = await page.evaluate(() => {
      const section = document.getElementById('the-turn');
      const img = section.querySelector('img');
      const style = window.getComputedStyle(img.parentElement);
      // parentElement is the motion.div driving the opacity
      return parseFloat(style.opacity) > 0.02; 
    });
    
    if (isVisible && !hasDisappeared) {
      if (!hasAppeared) hasAppeared = true;
      visibleSteps++;
    } else if (hasAppeared && !isVisible) {
      hasDisappeared = true;
    }
    
    // Capture screenshot every 3 steps (300px) to simulate a flipbook
    if (stepCount % 3 === 0) {
      await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_flipbook_${screenshotIndex}.png` });
      screenshotIndex++;
    }
  }

  // capture final state
  await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_flipbook_${screenshotIndex}.png` });
  
  console.log(`Total Steps: ${stepCount}`);
  console.log(`Steps where image was visible: ${visibleSteps}`);

  await browser.close();
})();
