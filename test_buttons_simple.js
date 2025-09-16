#!/usr/bin/env node

/**
 * Simple test to verify user buttons work
 */

import puppeteer from 'puppeteer';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testButtons() {
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
    await sleep(2000);

    // Take screenshot and check content
    const initialContent = await page.evaluate(() => document.body.textContent);
    console.log('Initial page content:', initialContent.substring(0, 100));

    // Click Get Started
    console.log('🎯 Clicking Get Started...');
    const getStartedFound = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent === 'Get Started') {
          el.click();
          return true;
        }
      }
      return false;
    });

    if (!getStartedFound) {
      throw new Error('Get Started button not found');
    }

    await sleep(2000);

    // Click Development Mode
    console.log('🔧 Clicking Development Mode...');
    const devModeFound = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent === 'Development Mode') {
          el.click();
          return true;
        }
      }
      return false;
    });

    if (!devModeFound) {
      const currentContent = await page.evaluate(() => document.body.textContent);
      console.log('Page content after Get Started:', currentContent.substring(0, 200));
      throw new Error('Development Mode button not found');
    }

    await sleep(2000);

    // Check for user selection screen
    const userSelectionContent = await page.evaluate(() => document.body.textContent);
    console.log('User selection content:', userSelectionContent.substring(0, 200));

    // Test User A button
    console.log('👤 Testing User A button...');
    const userAFound = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent && el.textContent.includes('Login as User A')) {
          el.click();
          return true;
        }
      }
      return false;
    });

    if (!userAFound) {
      throw new Error('User A button not found');
    }

    await sleep(3000);

    // Check if navigation worked
    const finalContent = await page.evaluate(() => document.body.textContent);
    console.log('Final content:', finalContent.substring(0, 200));

    const reachedMap = finalContent.includes('Map View') ||
                      finalContent.includes('Getting your location') ||
                      finalContent.includes('Grant Location Access');

    console.log('\n📊 Test Results:');
    console.log('✅ Get Started button: WORKING');
    console.log('✅ Development Mode button: WORKING');
    console.log('✅ User A button: WORKING');
    console.log(`${reachedMap ? '✅' : '❌'} Navigation to map: ${reachedMap ? 'SUCCESS' : 'FAILED'}`);

    return reachedMap;

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
testButtons()
  .then(success => {
    if (success) {
      console.log('\n🎉 Button functionality test PASSED!');
    } else {
      console.log('\n💥 Button functionality test FAILED!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });