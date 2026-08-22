const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.text().includes('TurnProgress:')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:8443/preview-v2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Find the top of the-turn
  const turnTop = await page.evaluate(() => document.getElementById('the-turn').offsetTop);
  const viewportHeight = 900;
  // The runway is 150svh -> 1350px.
  // offset: ['start start', 'end end']
  // start start = section top meets viewport top.
  // end end = section bottom meets viewport bottom.
  // So the total scroll distance is sectionHeight - viewportHeight = 1350 - 900 = 450px.
  
  const scrollStart = turnTop;
  const scrollRange = 450;
  
  console.log(`Section top: ${turnTop}, Range: ${scrollRange}`);

  for (let i = 0; i <= 4; i++) {
    const fraction = i * 0.25;
    const scrollPos = scrollStart + (scrollRange * fraction);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
    await new Promise(r => setTimeout(r, 800)); // wait for layout/animations
    
    // Check animations at 50%
    if (i === 2) {
      const animInfo = await page.evaluate(() => {
        const turnSection = document.getElementById('the-turn');
        const img = turnSection.querySelector('img');
        if (img) {
          const anims = img.getAnimations();
          return anims.map(a => ({ playState: a.playState, id: a.id }));
        }
        return [];
      });
      console.log("Animations at 50%:", animInfo);
    }
    
    // Log progress manually
    const actualProgress = await page.evaluate(() => {
       const section = document.getElementById('the-turn');
       const rect = section.getBoundingClientRect();
       const maxScroll = rect.height - window.innerHeight;
       const progress = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0;
       return progress;
    });
    console.log(`Checkpoint ${i * 25}%: scrollYProgress = ${actualProgress.toFixed(3)}`);
    
    await page.screenshot({ path: `/Users/ankurdutta/Downloads/code/turn_fixed_${i}.png` });
  }

  await browser.close();
})();
