// Test script for EINPresswire automation using ES modules
// Run with: node test-automation-browser.mjs

import { chromium } from 'playwright';

// Since we can't directly import the TypeScript file, we'll recreate the core functionality here
class EINPresswireAutomationTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'https://www.einpresswire.com';
    this.timeout = 30000;
  }

  async initialize(headless = false) {
    console.log('🚀 Initializing EINPresswire automation test...');
    
    try {
      this.browser = await chromium.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.timeout);
      
      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw new Error(`Browser initialization failed: ${error}`);
    }
  }

  async takeScreenshot() {
    if (!this.page) throw new Error('Page not available');
    const buffer = await this.page.screenshot();
    return buffer.toString('base64');
  }

  async testNavigationAndUI() {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('🔍 Testing EINPresswire website navigation...');
    
    try {
      // Navigate to the main site
      console.log('📄 Navigating to EINPresswire homepage...');
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Take screenshot of homepage
      console.log('📸 Taking homepage screenshot...');
      await this.takeScreenshot();
      
      console.log(`✅ Successfully loaded: ${this.page.url()}`);
      console.log(`📋 Page title: ${await this.page.title()}`);

      // Try to navigate to pricing page
      console.log('💰 Navigating to pricing page...');
      await this.page.goto(`${this.baseUrl}/pricing`, { waitUntil: 'networkidle' });
      
      console.log(`✅ Successfully loaded pricing: ${this.page.url()}`);
      console.log(`📋 Pricing page title: ${await this.page.title()}`);

      // Look for pricing elements
      console.log('🔍 Looking for pricing packages...');
      
      // Common pricing page selectors
      const packageSelectors = [
        'button:has-text("Get Started")',
        'button:has-text("Buy Now")',
        'a:has-text("Get Started")',
        'a:has-text("Buy Now")',
        '[class*="package"]',
        '[class*="pricing"]',
        '[class*="plan"]'
      ];

      let foundPackages = 0;
      for (const selector of packageSelectors) {
        try {
          const elements = await this.page.locator(selector).count();
          if (elements > 0) {
            console.log(`✅ Found ${elements} elements with selector: ${selector}`);
            foundPackages += elements;
          }
        } catch (error) {
          // Selector not found, continue
        }
      }

      if (foundPackages > 0) {
        console.log(`🎯 Total pricing elements found: ${foundPackages}`);
      } else {
        console.log('⚠️ No obvious pricing elements found - page structure may have changed');
      }

      // Look for submission/contact forms
      console.log('📝 Looking for submission forms...');
      
      const formSelectors = [
        'form',
        'input[type="email"]',
        'input[type="text"]',
        'textarea',
        'button[type="submit"]'
      ];

      let foundFormElements = 0;
      for (const selector of formSelectors) {
        try {
          const elements = await this.page.locator(selector).count();
          if (elements > 0) {
            console.log(`✅ Found ${elements} ${selector} elements`);
            foundFormElements += elements;
          }
        } catch (error) {
          // Selector not found, continue
        }
      }

      console.log(`📋 Total form elements found: ${foundFormElements}`);

      // Take final screenshot
      console.log('📸 Taking final screenshot...');
      await this.takeScreenshot();
      
      return {
        success: true,
        homepageUrl: this.baseUrl,
        pricingUrl: `${this.baseUrl}/pricing`,
        packageElementsFound: foundPackages,
        formElementsFound: foundFormElements
      };

    } catch (error) {
      console.error('❌ Navigation test failed:', error);
      
      // Take error screenshot
      try {
        await this.takeScreenshot();
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up browser resources...');
    
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

async function runBrowserTest() {
  console.log('🧪 Starting EINPresswire Browser Automation Test...');
  console.log('🌐 This will open a real browser window to test the automation');
  console.log('👀 Watch the browser to see the automation in action\n');
  
  const automation = new EINPresswireAutomationTest();
  
  try {
    // Initialize browser (visible for testing)
    await automation.initialize(false); // false = visible browser
    console.log('✅ Browser initialized and ready\n');
    
    // Test navigation and UI elements
    const result = await automation.testNavigationAndUI();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    if (result.success) {
      console.log('✅ Test Status: SUCCESS');
      console.log(`🏠 Homepage: ${result.homepageUrl}`);
      console.log(`💰 Pricing Page: ${result.pricingUrl}`);
      console.log(`📦 Package Elements Found: ${result.packageElementsFound}`);
      console.log(`📝 Form Elements Found: ${result.formElementsFound}`);
      
      if (result.packageElementsFound > 0 && result.formElementsFound > 0) {
        console.log('\n🎉 EXCELLENT! The site structure looks compatible with automation');
        console.log('💡 Next step: Run production automation with real data');
      } else {
        console.log('\n⚠️  WARNING: Limited elements found - automation may need updates');
        console.log('🔧 The selectors in the automation service may need adjustment');
      }
    } else {
      console.log('❌ Test Status: FAILED');
      console.log(`❗ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  } finally {
    // Always cleanup
    await automation.cleanup();
    console.log('\n🏁 Browser test completed');
  }
}

// Run the test
runBrowserTest().catch(console.error); 