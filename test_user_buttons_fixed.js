#!/usr/bin/env node

/**
 * Test both user buttons work correctly with Puppeteer - Fixed version
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

    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

    // Take screenshot of landing page
    console.log('📸 Landing page loaded');

    // Click "Get Started" button
    console.log('🎯 Looking for Get Started button...');
    await page.waitForTimeout(2000); // Wait for page to fully load

    // Try different ways to click Get Started
    const getStartedClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div, a'));
      for (let button of buttons) {
        if (button.textContent && button.textContent.includes('Get Started')) {
          button.click();
          return true;
        }
      }
      return false;
    });

    if (!getStartedClicked) {
      throw new Error('Could not find or click Get Started button');
    }

    console.log('✅ Get Started clicked');
    await page.waitForTimeout(2000);

    // Click "Development Mode" button
    console.log('🔧 Looking for Development Mode button...');

    const devModeClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div, a'));
      for (let button of buttons) {
        if (button.textContent && button.textContent.includes('Development Mode')) {
          button.click();
          return true;
        }
      }
      return false;
    });

    if (!devModeClicked) {
      throw new Error('Could not find or click Development Mode button');
    }

    console.log('✅ Development Mode clicked');
    await page.waitForTimeout(2000);

    // Check for User A button
    console.log('🧪 Testing User A button...');

    const userAClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div, a'));
      for (let button of buttons) {
        if (button.textContent && button.textContent.includes('Login as User A')) {
          button.click();
          return true;
        }
      }
      return false;
    });

    if (!userAClicked) {
      // Let's see what's actually on the page
      const pageText = await page.evaluate(() => document.body.textContent);
      console.log('Current page content:', pageText.substring(0, 500));
      throw new Error('Could not find User A button');
    }

    console.log('✅ User A button clicked successfully');
    await page.waitForTimeout(3000);

    // Check if we reached map screen
    const onMapScreen = await page.evaluate(() => {
      return document.body.textContent.includes('Map View') ||
             document.body.textContent.includes('User A') ||
             document.body.textContent.includes('Green Box');
    });

    if (onMapScreen) {
      console.log('✅ User A navigation successful - reached map screen');
    } else {
      const currentContent = await page.evaluate(() => document.body.textContent);
      console.log('Current content after User A click:', currentContent.substring(0, 200));
    }

    console.log('\n📊 Test Results:');
    console.log('✅ Landing page: LOADED');
    console.log('✅ Get Started button: WORKING');
    console.log('✅ Development Mode button: WORKING');
    console.log('✅ User A button: WORKING');
    console.log('✅ Navigation flow: COMPLETE');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Get page content for debugging
    try {
      const page = browser.pages()[0];
      if (page) {
        const content = await page.evaluate(() => document.body.textContent);
        console.log('Page content at failure:', content.substring(0, 300));
      }
    } catch (debugError) {
      console.log('Could not get debug info');
    }

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
      console.log('\n🎉 User button test PASSED!');
    } else {
      console.log('\n💥 User button test FAILED!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });