// Test script for EINPresswire automation
// Run with: node test-automation.js

const { EINPresswireAutomation } = require('./services/einpresswire-automation.ts');

async function testAutomation() {
  console.log('🧪 Starting EINPresswire automation test...');
  
  const automation = new EINPresswireAutomation();
  
  try {
    // Initialize browser (non-headless for debugging)
    await automation.initialize(false);
    console.log('✅ Browser initialized');
    
    // Test data
    const testSubmission = {
      title: 'BravaPress Launches Revolutionary AI-Powered Press Release Platform',
      content: `BravaPress, a cutting-edge SaaS platform, today announced the launch of its revolutionary AI-powered press release automation service. The platform combines OpenAI's advanced language models with browser automation to streamline the entire press release creation and distribution process.

      "Our platform eliminates the traditional friction in press release distribution," said the CEO of BravaPress. "By automating both content generation and submission, we're helping businesses focus on what matters most - their story."

      The service includes automated content generation, compliance validation, and direct submission to major distribution networks including EINPresswire. With pricing starting at $395 per release, BravaPress offers a comprehensive solution for companies of all sizes.

      For more information about BravaPress, visit https://bravapress.com.`,
      summary: 'BravaPress launches AI-powered press release automation platform combining OpenAI and browser automation for streamlined distribution.',
      companyName: 'BravaPress Inc.',
      contactName: 'John Doe',
      contactEmail: 'contact@bravapress.com',
      contactPhone: '+1-555-0123',
      websiteUrl: 'https://bravapress.com',
      industry: 'Technology',
      location: 'San Francisco, CA'
    };
    
    // Test package purchase
    console.log('💳 Testing package purchase...');
    const purchaseResult = await automation.purchasePackage('basic');
    console.log('Purchase result:', purchaseResult);
    
    if (purchaseResult.success) {
      // Test submission
      console.log('📤 Testing press release submission...');
      const submissionResult = await automation.submitPressRelease(testSubmission, purchaseResult.accessCredentials);
      console.log('Submission result:', submissionResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await automation.cleanup();
    console.log('🧹 Test completed');
  }
}

// Run test if called directly
if (require.main === module) {
  testAutomation().catch(console.error);
}

module.exports = { testAutomation }; 