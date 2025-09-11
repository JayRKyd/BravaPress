#!/usr/bin/env node

const JOB_PROCESS_URL = process.env.JOB_PROCESS_URL || 'http://localhost:3000/api/jobs/process';

async function processJobs() {
  try {
    console.log(`⏰ ${new Date().toISOString()} - Processing jobs...`);
    
    const response = await fetch(JOB_PROCESS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.processed) {
        console.log(`✅ Job processed: ${result.job_id} (${result.job_type})`);
      } else {
        console.log(`ℹ️  No jobs available`);
      }
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error(`🚨 Failed to process jobs:`, error.message);
  }
}

// Process jobs immediately, then every minute
processJobs();
setInterval(processJobs, 60000); // 60 seconds

console.log(`🚀 Job scheduler started - pinging ${JOB_PROCESS_URL} every minute`);