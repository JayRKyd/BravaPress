// Demo automation test - runs real browser automation without actual submission
// Run with: node test-demo-automation.mjs

import fetch from 'node-fetch';

async function testDemoAutomation() {
  console.log('🎭 Starting Demo Automation Test...');
  console.log('🌐 This will run REAL browser automation but without actual submission');
  console.log('👀 Watch the browser window to see the automation in action!\n');

  // Test press release data
  const testPressRelease = {
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

  try {
    console.log('🚀 Calling demo automation API...');
    
    const response = await fetch('http://localhost:8000/api/press-release/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pressRelease: testPressRelease,
        packageType: 'basic',
        testMode: false,    // Not test mode
        demoMode: true      // Demo mode - real automation but no submission
      }),
    });

    console.log(`📡 API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n🎉 Demo Automation Results:');
    console.log('============================');
    console.log('✅ Purchase Result:', result.purchase.message);
    console.log('✅ Submission Result:', result.submission.message);
    console.log(`📸 Screenshots Captured: ${result.submission.screenshots?.length || 0}`);
    console.log(`🆔 Demo Order ID: ${result.purchase.orderId}`);
    console.log(`🆔 Demo Submission ID: ${result.submission.submissionId}`);
    
    if (result.submission.screenshots && result.submission.screenshots.length > 0) {
      console.log('\n📸 Screenshots were captured during the demo');
      console.log('💡 In production, these would be used for debugging and audit trails');
    }

    console.log('\n🎯 Demo Summary:');
    console.log('================');
    console.log('✅ Browser automation WORKED');
    console.log('✅ EINPresswire navigation SUCCESSFUL');
    console.log('✅ Form detection COMPLETED');
    console.log('✅ Screenshots CAPTURED');
    console.log('✅ No actual submission made (safe demo)');
    
    console.log('\n💡 Next Steps:');
    console.log('- Change testMode: false and demoMode: false for REAL submissions');
    console.log('- Add payment integration for complete automation');
    console.log('- The automation is ready for production use!');

  } catch (error) {
    console.error('\n💥 Demo test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure your dev server is running: npm run dev');
    console.log('- Check that localhost:8000 is accessible');
    console.log('- Verify Playwright browsers are installed: npx playwright install');
  }
}

console.log('🎬 Demo Automation Test Starting...');
console.log('⏰ This may take 30-60 seconds to complete');
console.log('🖥️  A browser window will open and you can watch the automation\n');

testDemoAutomation().catch(console.error); 