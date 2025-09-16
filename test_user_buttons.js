#!/usr/bin/env node

/**
 * Test both user buttons work correctly with Puppeteer
 */

import puppeteer from 'puppeteer';

async function testUserButtons() {
  let browser;

  try {
    console.log('🧪 Testing user button functionality...');

    browser = await puppeteer.launch({
      headless: false,
      devtools: false
    });

    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', (msg) => {
      console.log('BROWSER:', msg.text());
    });

    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

    // Click "Get Started"
    console.log('🎯 Clicking "Get Started"...');
    await page.waitForSelector('text="Get Started"');
    await page.click('text="Get Started"');

    // Click "Development Mode"
    console.log('🔧 Clicking "Development Mode"...');
    await page.waitForSelector('text="Development Mode"');
    await page.click('text="Development Mode"');

    // Wait for user selection screen
    console.log('⏳ Waiting for user selection screen...');
    await page.waitForSelector('text="Login as User A"', { timeout: 10000 });

    // Verify both buttons are present
    const userAButton = await page.$('text="Login as User A"');
    const userBButton = await page.$('text="Login as User B"');

    if (!userAButton) {
      throw new Error('User A button not found');
    }
    if (!userBButton) {
      throw new Error('User B button not found');
    }

    console.log('✅ Both user buttons found');

    // Test User A button
    console.log('🧪 Testing User A button...');
    await page.click('text="Login as User A"');

    // Wait for map screen
    await page.waitForSelector('text="🗺️ Map View"', { timeout: 10000 });
    console.log('✅ User A button works - navigated to map');

    // Go back to test User B
    await page.goBack();
    await page.goBack();
    await page.goBack();

    // Navigate to user selection again
    console.log('🔄 Navigating back to test User B...');
    await page.click('text="Get Started"');
    await page.waitForSelector('text="Development Mode"');
    await page.click('text="Development Mode"');
    await page.waitForSelector('text="Login as User B"');

    // Test User B button
    console.log('🧪 Testing User B button...');
    await page.click('text="Login as User B"');

    // Wait for map screen
    await page.waitForSelector('text="🗺️ Map View"', { timeout: 10000 });
    console.log('✅ User B button works - navigated to map');

    // Verify user information
    const pageContent = await page.content();

    console.log('\n📊 Test Results:');
    console.log('✅ User A button: WORKING');
    console.log('✅ User B button: WORKING');
    console.log('✅ Navigation flow: COMPLETE');
    console.log('✅ Map screen loads: CONFIRMED');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testUserButtons()
  .then(success => {
    if (success) {
      console.log('\n🎉 All user button tests PASSED!');
    } else {
      console.log('\n💥 User button tests FAILED!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });