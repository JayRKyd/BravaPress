// Test script for BravaPress Background Job System
// This demonstrates how to use the job queue system

console.log('🚀 Testing BravaPress Background Job System\n');

// Test job queue endpoints
const BASE_URL = 'http://localhost:8000';

async function testJobSystem() {
  try {
    console.log('1. 📊 Getting job queue status...');
    const statusResponse = await fetch(`${BASE_URL}/api/jobs/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ Queue Status:', JSON.stringify(statusData.summary, null, 2));
    } else {
      console.log('❌ Failed to get status:', statusData.error);
    }
    
    console.log('\n2. 🔄 Manually triggering job processing...');
    const triggerResponse = await fetch(`${BASE_URL}/api/jobs/status`, {
      method: 'POST'
    });
    const triggerData = await triggerResponse.json();
    
    if (triggerData.success) {
      console.log('✅ Job processing triggered');
      console.log('📋 Processor result:', JSON.stringify(triggerData.processor_result, null, 2));
    } else {
      console.log('❌ Failed to trigger processing:', triggerData.error);
    }
    
    console.log('\n3. 📊 Getting updated queue status...');
    const updatedStatusResponse = await fetch(`${BASE_URL}/api/jobs/status`);
    const updatedStatusData = await updatedStatusResponse.json();
    
    if (updatedStatusData.success) {
      console.log('✅ Updated Queue Status:', JSON.stringify(updatedStatusData.summary, null, 2));
    } else {
      console.log('❌ Failed to get updated status:', updatedStatusData.error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

// Instructions for setting up the job system
console.log(`
📋 Instructions for Setting Up Background Job System:

1. **Database Setup:**
   Run the SQL script to create tables and functions:
   \`node -e "console.log('Run database_jobs_setup.sql in your Supabase dashboard')"\`

2. **Environment Variables:**
   Make sure you have these in your .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY (for content generation)

3. **Job Processing:**
   - Manual: POST to /api/jobs/status
   - Automatic: Set up a cron job to hit /api/jobs/process every minute
   - Monitoring: GET /api/jobs/status for queue health

4. **Production Setup:**
   - Use a proper job scheduler (cron, GitHub Actions, etc.)
   - Set up alerts for failed jobs
   - Monitor queue depth and processing times

🎯 **How it works:**
1. Customer submits press release → creates job in queue
2. Background processor picks up job → runs automation
3. Updates submission status → sends notifications
4. Monitoring dashboard shows real-time status

Ready to test? Make sure your server is running on port 8000...
`);

// Run the test if the server is available
if (process.argv.includes('--run-test')) {
  console.log('🧪 Running job system test...\n');
  testJobSystem();
} else {
  console.log('💡 Add --run-test flag to run the actual test');
} 