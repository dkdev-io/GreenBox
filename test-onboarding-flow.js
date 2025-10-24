const puppeteer = require('puppeteer');

async function testOnboardingFlow() {
  console.log('🚀 Starting Green Box Onboarding Flow Test...\n');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/automated testing
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1200, height: 800 }
  });

  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('📱 Navigating to http://localhost:3010...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

    // Wait for initial load
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ App loaded successfully\n');

    // Test 1: Landing Screen
    console.log('🔍 Testing Landing Screen...');
    await testLandingScreen(page);

    // Test 2: Auth Login Screen
    console.log('🔍 Testing Auth Login Screen...');
    await testAuthLoginScreen(page);

    // Test 3: Development Mode (Legacy Auth)
    console.log('🔍 Testing Development Mode...');
    await testDevelopmentMode(page);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

async function testLandingScreen(page) {
  // Check if landing screen elements are present
  try {
    await page.waitForSelector('body', { timeout: 5000 });

    // Check page content for app title
    const pageContent = await page.content();
    if (pageContent.includes('Green Box')) {
      console.log('  ✅ App title found in page content');
    } else {
      throw new Error('App title "Green Box" not found anywhere on landing screen');
    }

    // Debug: Log page content to see what elements exist
    console.log('  🔍 Page structure:');
    const allElements = await page.$$('*');
    console.log(`  🔍 Found ${allElements.length} total elements`);

    // Check for clickable elements more broadly
    const clickables = await page.$$('[onclick], [role], .button, .btn, button, input[type="button"], input[type="submit"]');
    console.log(`  🔍 Found ${clickables.length} potentially clickable elements`);

    // React Native Web renders buttons as DIVs, so look for DIVs with button text
    const allDivs = await page.$$('div');
    let getStartedFound = false;
    let loginFound = false;

    console.log(`  🔍 Found ${allDivs.length} div elements`);

    for (const div of allDivs) {
      const text = await page.evaluate(el => el.textContent, div);

      // Look for divs that contain exactly the button text (not nested content)
      if (text === 'Get Started') {
        getStartedFound = true;
        console.log('  ✅ Get Started button found');
        // Click Get Started to proceed
        await div.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      } else if (text === 'Log In') {
        loginFound = true;
        console.log('  ✅ Log In button found');
      }
    }

    if (!getStartedFound) {
      throw new Error('Get Started button not found');
    }

    if (loginFound) {
      console.log('  ✅ Log In button found');
    }

  } catch (error) {
    throw error;
  }

  console.log('  ✅ Successfully navigated from Landing Screen\n');
}

async function testAuthLoginScreen(page) {
  // Check auth screen elements by looking for content
  const pageContent = await page.content();

  if (pageContent.includes('Welcome to Green Box')) {
    console.log('  ✅ Welcome title found');
  } else {
    console.log('  ⚠️  Welcome title not found');
  }

  if (pageContent.includes('Sign in to start sharing')) {
    console.log('  ✅ Auth subtitle found');
  }

  // Look for auth buttons (React Native Web renders as DIVs)
  const divs = await page.$$('div');
  let appleFound = false;
  let googleFound = false;
  let devFound = false;

  for (const div of divs) {
    const text = await page.evaluate(el => el.textContent, div);
    if (text === 'Continue with Apple') {
      appleFound = true;
    } else if (text === 'Continue with Google') {
      googleFound = true;
    } else if (text === 'Development Mode') {
      devFound = true;
    }
  }

  if (appleFound) console.log('  ✅ Apple Sign In button found');
  if (googleFound) console.log('  ✅ Google Sign In button found');
  if (devFound) {
    console.log('  ✅ Development Mode button found');
  } else {
    console.log('  ⚠️  Development Mode button not found (expected in production)');
  }

  console.log('  ✅ Auth Login Screen test completed\n');
}

async function testDevelopmentMode(page) {
  // Try to find and click Development Mode button (React Native Web DIV)
  const divs = await page.$$('div');
  let devButton = null;

  for (const div of divs) {
    const text = await page.evaluate(el => el.textContent, div);
    if (text === 'Development Mode') {
      devButton = div;
      break;
    }
  }

  if (!devButton) {
    console.log('  ⚠️  Skipping Development Mode test - button not available');
    return;
  }

  await devButton.click();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if we're on the user selection screen
  const pageContent = await page.content();
  if (pageContent.includes('Select User')) {
    console.log('  ✅ Navigated to User Selection screen');

    // Look for user selection buttons (React Native Web DIVs)
    const divs = await page.$$('div');
    let userAButton = null;

    for (const div of divs) {
      const text = await page.evaluate(el => el.textContent, div);
      if (text === 'Login as User A') {
        userAButton = div;
        console.log('  ✅ User A login button found');
        break;
      }
    }

    if (userAButton) {
      // Test clicking User A
      await userAButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if we've navigated to the main app
      await testMainAppScreen(page);
    } else {
      console.log('  ⚠️  User selection buttons not found');
    }
  } else {
    console.log('  ⚠️  User Selection screen not found after clicking Development Mode');
  }

  console.log('  ✅ Development Mode test completed\n');
}

async function testMainAppScreen(page) {
  console.log('🔍 Testing Main App Screen...');

  // Wait for potential loading
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check page content
  const pageContent = await page.content();

  // Check for sign out button
  if (pageContent.includes('Sign Out')) {
    console.log('  ✅ Sign Out button found');
  }

  // Check for empty state elements
  if (pageContent.includes('Welcome to Green Box!')) {
    console.log('  ✅ Welcome title found in empty state');
  }

  if (pageContent.includes('Start sharing your location securely')) {
    console.log('  ✅ Empty state subtitle found');
  }

  // Check for feature items
  if (pageContent.includes('End-to-end encrypted')) {
    console.log('  ✅ Encryption feature found');
  }

  if (pageContent.includes('Auto-deletes after 10 minutes')) {
    console.log('  ✅ Auto-delete feature found');
  }

  if (pageContent.includes('You control who sees your location')) {
    console.log('  ✅ Control feature found');
  }

  // Test the main call-to-action button (React Native Web DIV)
  const divs = await page.$$('div');
  let inviteButton = null;

  for (const div of divs) {
    const text = await page.evaluate(el => el.textContent, div);
    if (text === 'Invite Your First Friend') {
      inviteButton = div;
      console.log('  ✅ "Invite Your First Friend" button found');
      break;
    }
  }

  if (inviteButton) {
    // Set up dialog handler before clicking
    page.on('dialog', async dialog => {
      console.log('  ✅ Alert dialog appeared:', dialog.message());
      await dialog.accept();
    });

    await inviteButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('  ✅ Main App Screen test completed\n');
}

// Additional test for permission screens (if accessible)
async function testPermissionScreens(page) {
  console.log('🔍 Testing Permission Screens...');

  // These screens are typically shown after OAuth authentication
  // For now, we'll check if they exist in the DOM or are accessible

  const permissionElements = [
    'text=Location Access',
    'text=End-to-End Encrypted',
    'text=Automatic Deletion',
    'text=You Choose Who Sees',
    'text=Allow Location Access',
    'text=Stay Connected',
    'text=Enable Background Sharing'
  ];

  for (const selector of permissionElements) {
    const element = await page.$(selector).catch(() => null);
    if (element) {
      console.log(`  ✅ Found permission element: ${selector}`);
    }
  }

  console.log('  ✅ Permission screens test completed\n');
}

// Run the test
testOnboardingFlow().catch(console.error);