// Simple browser test for EINPresswire automation
// Run with: node test-simple-browser.mjs

import { chromium } from 'playwright';

async function simpleBrowserTest() {
  console.log('🚀 Starting Simple EINPresswire Browser Test...');
  console.log('🌐 This will open a browser and check basic navigation\n');
  
  let browser = null;
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,  // Visible browser
      timeout: 60000    // 1 minute timeout
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(15000); // 15 second timeout
    
    console.log('✅ Browser launched successfully');
    
    // Test 1: Navigate to homepage
    console.log('📄 Step 1: Navigating to EINPresswire homepage...');
    try {
      await page.goto('https://www.einpresswire.com', { 
        waitUntil: 'domcontentloaded',  // Less strict than networkidle
        timeout: 15000 
      });
      
      const title = await page.title();
      console.log(`✅ Homepage loaded! Title: "${title}"`);
      
      // Wait a moment for user to see
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.log(`❌ Homepage failed: ${error.message}`);
      return;
    }
    
    // Test 2: Navigate to pricing
    console.log('💰 Step 2: Navigating to pricing page...');
    try {
      await page.goto('https://www.einpresswire.com/pricing', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      const title = await page.title();
      console.log(`✅ Pricing page loaded! Title: "${title}"`);
      
      // Wait a moment for user to see
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.log(`❌ Pricing page failed: ${error.message}`);
      // Continue anyway
    }
    
    // Test 3: Look for interactive elements
    console.log('🔍 Step 3: Looking for buttons and forms...');
    try {
      // Count buttons
      const buttonCount = await page.locator('button').count();
      const linkCount = await page.locator('a').count();
      const inputCount = await page.locator('input').count();
      
      console.log(`📊 Found: ${buttonCount} buttons, ${linkCount} links, ${inputCount} inputs`);
      
      // Look for specific text
      const hasGetStarted = await page.locator('text=Get Started').count();
      const hasBuyNow = await page.locator('text=Buy Now').count();
      const hasSubmit = await page.locator('text=Submit').count();
      
      console.log(`🎯 Action buttons: ${hasGetStarted} "Get Started", ${hasBuyNow} "Buy Now", ${hasSubmit} "Submit"`);
      
    } catch (error) {
      console.log(`⚠️ Element search failed: ${error.message}`);
    }
    
    // Test 4: Take a screenshot
    console.log('📸 Step 4: Taking screenshot...');
    try {
      await page.screenshot({ path: 'einpresswire-test.png', fullPage: true });
      console.log('✅ Screenshot saved as: einpresswire-test.png');
    } catch (error) {
      console.log(`⚠️ Screenshot failed: ${error.message}`);
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('👀 The browser window will stay open for 10 seconds so you can see the page');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run the test
simpleBrowserTest().catch(console.error); 