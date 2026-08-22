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
      window.scrollTo(0, section.offsetTop);
    }, 500);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Screenshot 1: Top of section
  await page.evaluate(() => {
    const section = document.getElementById('interview');
    window.scrollTo(0, section.offsetTop - 100); // just above
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/interview_scroll_1.png' });

  // Screenshot 2: Middle of section
  await page.evaluate(() => {
    const section = document.getElementById('interview');
    window.scrollTo(0, section.offsetTop + section.offsetHeight / 2 - window.innerHeight / 2);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/interview_scroll_2.png' });

  // Screenshot 3: Bottom of section
  await page.evaluate(() => {
    const section = document.getElementById('interview');
    window.scrollTo(0, section.offsetTop + section.offsetHeight - window.innerHeight + 100);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/Users/ankurdutta/Downloads/code/interview_scroll_3.png' });

  await browser.close();
})();
