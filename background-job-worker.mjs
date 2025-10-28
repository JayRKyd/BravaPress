// BravaPress Background Job Worker
// This script runs in the background and triggers the job processor every minute

const API_URL = process.env.JOB_PROCESS_URL || 'http://localhost:8000/api/jobs/process';
const INTERVAL_MS = 60 * 1000; // 1 minute

console.log(`🚀 BravaPress Background Job Worker started. Will process jobs every 60 seconds.`);
console.log(`🔗 Target endpoint: ${API_URL}`);

async function processJob() {
  try {
    const res = await fetch(API_URL, { method: 'POST' });
    const data = await res.json();
    // Align logging with /api/jobs/process response shape
    if (res.ok && data && data.success) {
      console.log(`[${new Date().toISOString()}] ✅ Job processed:`, data.job_id);
    } else if (res.ok && data && data.message === 'No jobs available') {
      console.log(`[${new Date().toISOString()}] ℹ️ No jobs to process.`);
    } else {
      console.log(`[${new Date().toISOString()}] ⚠️ Job processor responded:`, data);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error processing job:`, err.message);
  }
}

// Run immediately, then every minute
processJob();
setInterval(processJob, INTERVAL_MS); 