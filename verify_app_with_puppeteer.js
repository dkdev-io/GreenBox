#!/usr/bin/env node

/**
 * Puppeteer verification script to check if the app loads correctly
 */

import puppeteer from 'puppeteer';

async function verifyAppWithPuppeteer() {
  let browser;

  try {
    console.log('🚀 Starting Puppeteer verification...');

    browser = await puppeteer.launch({
      headless: false, // Set to false to see what's happening
      devtools: true
    });

    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', (msg) => {
      console.log('BROWSER CONSOLE:', msg.type(), msg.text());
    });

    // Listen for page errors
    page.on('error', (error) => {
      console.log('BROWSER ERROR:', error.message);
    });

    // Listen for unhandled rejections
    page.on('pageerror', (error) => {
      console.log('BROWSER PAGE ERROR:', error.message);
    });

    console.log('📱 Navigating to http://localhost:3010...');

    // Navigate to the app
    const response = await page.goto('http://localhost:3010', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('📊 Response status:', response.status());

    // Wait for content to load
    console.log('⏳ Waiting for content to load...');

    try {
      // Wait for either the app content or an error message
      await Promise.race([
        page.waitForSelector('div[id="root"]', { timeout: 10000 }),
        page.waitForSelector('body', { timeout: 10000 })
      ]);

      // Check what's actually in the page
      const bodyText = await page.evaluate(() => document.body.innerText);
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);

      console.log('📄 Page body text:', bodyText.substring(0, 200));
      console.log('🔍 Page body HTML length:', bodyHTML.length);

      // Check for specific elements
      const hasReactRoot = await page.evaluate(() => !!document.getElementById('root'));
      const hasReactContent = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      });

      console.log('✅ Has React root element:', hasReactRoot);
      console.log('✅ Has React content:', hasReactContent);

      // Check for any JavaScript errors
      const errors = await page.evaluate(() => {
        return window.errors || [];
      });

      if (errors.length > 0) {
        console.log('❌ JavaScript errors found:', errors);
      }

      // Check network requests
      const performanceEntries = await page.evaluate(() => {
        return performance.getEntriesByType('navigation').map(entry => ({
          name: entry.name,
          responseStart: entry.responseStart,
          loadEventEnd: entry.loadEventEnd
        }));
      });

      console.log('🌐 Network performance:', performanceEntries);

      // Take a screenshot
      await page.screenshot({ path: '/tmp/greenbox-app-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved to /tmp/greenbox-app-screenshot.png');

      // Final assessment
      if (hasReactRoot && hasReactContent) {
        console.log('✅ SUCCESS: App appears to be loading correctly');
        return true;
      } else if (hasReactRoot && !hasReactContent) {
        console.log('⚠️  WARNING: React root exists but no content rendered');
        return false;
      } else {
        console.log('❌ FAILURE: No React app detected');
        return false;
      }

    } catch (waitError) {
      console.log('❌ Timeout waiting for content:', waitError.message);

      // Still try to get what we can
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('📄 Page content (on timeout):', bodyText);

      return false;
    }

  } catch (error) {
    console.error('❌ Puppeteer verification failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Install puppeteer if not available
try {
  await verifyAppWithPuppeteer();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('📦 Installing puppeteer...');
    const { execSync } = await import('child_process');
    execSync('npm install puppeteer', { stdio: 'inherit' });
    console.log('✅ Puppeteer installed, retrying...');
    await verifyAppWithPuppeteer();
  } else {
    throw error;
  }
}