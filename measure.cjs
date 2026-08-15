const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8444/practice');
  await new Promise(r => setTimeout(r, 2000));
  
  const data = await page.evaluate(() => {
    const header = document.querySelector('h1').parentElement.parentElement;
    const btns = Array.from(header.querySelectorAll('button'));
    return btns.map(b => ({
      text: b.innerText,
      width: b.getBoundingClientRect().width,
      scrollWidth: b.scrollWidth,
      padding: window.getComputedStyle(b).padding,
      fontWeight: window.getComputedStyle(b).fontWeight,
      transition: window.getComputedStyle(b).transition
    }));
  });
  console.log("DOM state:", data);

  await browser.close();
})();
