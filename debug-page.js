const puppeteer = require('puppeteer');

async function debugPage() {
  console.log('🔍 Debugging Green Box page structure...');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get page content sample
    const content = await page.content();
    console.log(`Page content length: ${content.length}`);

    // Look for React Native web elements (typically divs with specific attributes)
    const rnElements = await page.$$('div[data-react-native], div[class*="react"]');
    console.log(`React Native elements found: ${rnElements.length}`);

    // Look for all divs
    const divs = await page.$$('div');
    console.log(`Total divs found: ${divs.length}`);

    // Look for text content containing our button text
    const textContent = await page.evaluate(() => document.body.textContent);
    console.log('Text content includes "Get Started":', textContent.includes('Get Started'));
    console.log('Text content includes "Log In":', textContent.includes('Log In'));

    // Look for elements by tag name
    const allTags = ['button', 'div', 'span', 'a', 'input'];
    for (const tag of allTags) {
      const elements = await page.$$(tag);
      console.log(`${tag} elements found: ${elements.length}`);
    }

    // Try to find elements containing button text
    const elements = await page.$$('*');
    let foundButtons = [];

    for (const element of elements.slice(0, 100)) { // Check first 100 elements
      try {
        const text = await page.evaluate(el => el.textContent, element);
        const tagName = await page.evaluate(el => el.tagName, element);
        if (text && (text.includes('Get Started') || text.includes('Log In'))) {
          foundButtons.push({ tagName, text: text.trim() });
        }
      } catch (e) {
        // Skip elements that can't be evaluated
      }
    }

    console.log('Elements with button text:', foundButtons);

    // Print part of the actual HTML
    const htmlSample = content.substring(0, 2000);
    console.log('\nHTML sample:');
    console.log(htmlSample);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugPage().catch(console.error);