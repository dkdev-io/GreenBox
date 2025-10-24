const puppeteer = require('puppeteer');

async function testMainAppDetailed() {
  console.log('🔍 Testing Main App Screen in Detail...\n');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to app and go through dev flow to reach main app
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

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🔍 Now testing main app screen...');

    // Get page content
    const pageContent = await page.content();

    // Test for all expected elements
    const expectedElements = [
      'Sign Out',
      'Welcome to Green Box!',
      'Start sharing your location securely',
      'End-to-end encrypted',
      'Auto-deletes after 10 minutes',
      'You control who sees your location',
      'Invite Your First Friend'
    ];

    console.log('Testing for expected elements:');
    for (const element of expectedElements) {
      if (pageContent.includes(element)) {
        console.log(`  ✅ "${element}" found`);
      } else {
        console.log(`  ❌ "${element}" NOT found`);
      }
    }

    // Test clicking the invite button
    const divs4 = await page.$$('div');
    let inviteButtonFound = false;

    for (const div of divs4) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Invite Your First Friend') {
        console.log('\n🔍 Testing invite button click...');

        // Set up dialog handler
        page.on('dialog', async dialog => {
          console.log(`  ✅ Alert appeared: "${dialog.message()}"`);
          await dialog.accept();
        });

        await div.click();
        inviteButtonFound = true;
        break;
      }
    }

    if (!inviteButtonFound) {
      console.log('  ❌ Invite button not found for clicking');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n✅ Main app screen test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testMainAppDetailed().catch(console.error);