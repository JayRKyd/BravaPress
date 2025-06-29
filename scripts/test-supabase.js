const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Set' : '❌ Missing');
  process.exit(1);
}

console.log('Testing connection to:', supabaseUrl);
console.log('Using service role key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function testConnection() {
  try {
    console.log('\n--- Testing RPC ---');
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('RPC Error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } else {
      console.log('RPC Success! Server time:', data);
    }
  } catch (error) {
    console.error('RPC Exception:', error);
  }

  try {
    console.log('\n--- Testing REST API ---');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    console.log('REST API Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const error = await response.text().catch(() => 'Could not read error response');
      console.error('REST API Error Response:', error);
    } else {
      const data = await response.json();
      console.log('REST API Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('REST API Exception:', error);
  }
}

testConnection().catch(console.error);
