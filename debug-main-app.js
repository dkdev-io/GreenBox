const puppeteer = require('puppeteer');

async function debugMainApp() {
  console.log('🔍 Debugging Main App State...\n');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate and go through flow
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Click Get Started
    const divs1 = await page.$$('div');
    for (const div of divs1) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Get Started') {
        await div.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click Development Mode
    const divs2 = await page.$$('div');
    for (const div of divs2) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Development Mode') {
        await div.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click Login as User A
    const divs3 = await page.$$('div');
    for (const div of divs3) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Login as User A') {
        await div.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 8000)); // Wait longer

    console.log('🔍 Current page state after login:');

    // Get current page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get all text content
    const textContent = await page.evaluate(() => document.body.textContent);
    console.log(`Page text content: "${textContent}"`);

    // Get current URL
    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Get page content length
    const content = await page.content();
    console.log(`Page content length: ${content.length}`);

    // Look for loading indicators
    if (textContent.includes('Loading') || textContent.includes('loading')) {
      console.log('⏳ Page appears to be loading...');
    }

    // Look for error messages
    if (textContent.includes('Error') || textContent.includes('error')) {
      console.log('❌ Page appears to have errors...');
    }

    // Check browser console for errors
    const logs = await page.evaluate(() => {
      return window.console;
    });

    // Print first 1000 chars of content for inspection
    console.log('\nFirst 1000 chars of page content:');
    console.log(content.substring(0, 1000));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugMainApp().catch(console.error);