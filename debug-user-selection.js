const puppeteer = require('puppeteer');

async function debugUserSelection() {
  console.log('🔍 Debugging User Selection Button Clicks...\n');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to user selection directly
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Navigate to user selection
    console.log('📍 Step 1: Clicking Get Started...');
    const divs1 = await page.$$('div');
    for (const div of divs1) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Get Started') {
        await div.click();
        console.log('✅ Get Started clicked');
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📍 Step 2: Clicking Development Mode...');
    const divs2 = await page.$$('div');
    for (const div of divs2) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Development Mode') {
        await div.click();
        console.log('✅ Development Mode clicked');
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📍 Step 3: Analyzing User Selection screen...');

    // Check if we're on user selection screen
    const pageContent = await page.content();
    if (pageContent.includes('Select User')) {
      console.log('✅ On User Selection screen');
    } else {
      console.log('❌ Not on User Selection screen');
      return;
    }

    // Get all divs and analyze their properties
    const divs3 = await page.$$('div');
    console.log(`🔍 Found ${divs3.length} div elements`);

    let userAButton = null;
    let userBButton = null;

    for (let i = 0; i < divs3.length; i++) {
      const div = divs3[i];
      const text = await page.evaluate(el => el.textContent, div);

      if (text === 'Login as User A') {
        userAButton = div;
        console.log(`🎯 Found "Login as User A" button at index ${i}`);

        // Check if it's clickable
        const isClickable = await page.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            pointerEvents: style.pointerEvents,
            cursor: style.cursor,
            position: style.position,
            display: style.display,
            visibility: style.visibility,
            zIndex: style.zIndex
          };
        }, div);

        console.log('  Button styles:', isClickable);

        // Try to get onclick handler
        const hasOnClick = await page.evaluate(el => {
          return {
            hasOnClick: typeof el.onclick === 'function',
            hasEventListeners: el.getAttribute('data-has-listeners') || 'unknown'
          };
        }, div);

        console.log('  Event handlers:', hasOnClick);

      } else if (text === 'Login as User B') {
        userBButton = div;
        console.log(`🎯 Found "Login as User B" button at index ${i}`);
      }
    }

    if (userAButton) {
      console.log('\n📍 Step 4: Attempting to click User A button...');

      // Try different click methods
      console.log('🔄 Method 1: Standard click');
      await userAButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if navigation happened
      const currentContent = await page.content();
      if (!currentContent.includes('Select User')) {
        console.log('✅ Navigation successful with standard click!');
        return;
      }

      console.log('🔄 Method 2: Evaluate click');
      await page.evaluate(el => el.click(), userAButton);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentContent2 = await page.content();
      if (!currentContent2.includes('Select User')) {
        console.log('✅ Navigation successful with evaluate click!');
        return;
      }

      console.log('🔄 Method 3: Dispatch click event');
      await page.evaluate(el => {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(event);
      }, userAButton);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentContent3 = await page.content();
      if (!currentContent3.includes('Select User')) {
        console.log('✅ Navigation successful with dispatch event!');
        return;
      }

      console.log('❌ All click methods failed');

      // Check if there are any console errors
      const logs = await page.evaluate(() => {
        // This won't work as intended, but let's check for errors differently
        return 'Console check complete';
      });

    } else {
      console.log('❌ User A button not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Don't close browser to inspect manually
    console.log('\n🔍 Browser left open for manual inspection...');
    console.log('Press Ctrl+C to close when done inspecting.');
  }
}

debugUserSelection().catch(console.error);