const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  const results = await page.evaluate(async () => {
    const output = {};
    const turnSection = document.getElementById('the-turn');
    if (!turnSection) {
      output.error = 'No section with id "the-turn" found';
      return output;
    }
    
    const rect = turnSection.getBoundingClientRect();
    output.turnRect = { height: rect.height, top: rect.top, bottom: rect.bottom };
    
    // Check for runwayRef element (which doesn't exist in source, but we will look for any 200vh-ish element or just the section itself)
    output.note = "No runwayRef found in TurnV2.tsx source; it is just a normal section using ScrollReveal.";
    
    // Get HeroV2 height
    const heroSection = document.getElementById('hero'); // Assuming it has id hero
    if (heroSection) {
      output.heroHeight = heroSection.getBoundingClientRect().height;
    } else {
      output.heroHeight = 'Not found (no id "hero")';
    }
    
    // Check getAnimations on image
    const img = turnSection.querySelector('img');
    if (img) {
      const anims = img.getAnimations();
      output.imageAnimations = anims.map(a => ({ playState: a.playState, id: a.id }));
    }
    
    return output;
  });
  
  console.log("DIAGNOSTIC RESULTS:\n" + JSON.stringify(results, null, 2));

  // Taking 5 checkpoints screenshots across the TurnV2 section
  // Since we don't have a runwayRef, we'll just scroll through the-turn section
  
  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const turnHeight = results.turnRect.height;
  const viewportHeight = 900;
  
  // Calculate scroll positions so that the section sweeps through the viewport
  // Start: section top enters bottom of viewport
  // End: section bottom leaves top of viewport
  const scrollStart = Math.max(0, turnTop - viewportHeight);
  const scrollEnd = turnTop + turnHeight;
  const scrollRange = scrollEnd - scrollStart;
  
  for (let i = 0; i <= 4; i++) {
    const fraction = i * 0.25;
    const scrollPos = scrollStart + (scrollRange * fraction);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
    await new Promise(r => setTimeout(r, 800)); // wait for layout/animations
    await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_checkpoint_${i}.png` });
    console.log(`Screenshot ${i} taken at scrollY: ${scrollPos}`);
  }

  await browser.close();
})();
