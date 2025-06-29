import { NextResponse } from 'next/server';
import { createClient as createClientDirect } from '@supabase/supabase-js';

type ConnectionResult = {
  success: boolean;
  data: any;
  error: string | null;
  details?: string;
};

type TestResults = {
  config: {
    url: string | null;
    anonKey: string;
  };
  connection: ConnectionResult;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Initialize results object
  const results: TestResults = {
    config: {
      url: supabaseUrl || null,
      anonKey: supabaseAnonKey ? '*** (key is set)' : '❌ Missing',
    },
    connection: {
      success: false,
      data: null,
      error: null,
    },
  };

  // Check for required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
      !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter(Boolean);

    return NextResponse.json({
      ...results,
      connection: {
        success: false,
        data: null,
        error: `Missing required environment variables: ${missing.join(', ')}`,
      },
    }, { status: 400 });
  }

  // Test the connection with both anon key and service role key
  try {
    // Create client with anon key
    const supabase = createClientDirect(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    
    // Also create a client with service role key for admin access
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = supabaseServiceKey ? 
      createClientDirect(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }) : null;

    try {
      // First try with regular anon key
      const anonResults: Record<string, any> = {};
      
      // Try to query the submissions table
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .limit(1);
      
      anonResults.submissions = submissionsError ? 
        { error: submissionsError.message } : 
        { success: true, count: submissionsData?.length || 0 };
      
      // If anon key failed and we have admin access, try with service role key
      let adminResults: Record<string, any> = {};
      
      if (supabaseAdmin && Object.values(anonResults).every(result => 'error' in result)) {
        // Try admin access to submissions
        const { data: adminSubmissionsData, error: adminSubmissionsError } = await supabaseAdmin
          .from('submissions')
          .select('*')
          .limit(1);
        
        // Try admin access to press_releases
        const { data: adminPressReleasesData, error: adminPressReleasesError } = await supabaseAdmin
          .from('press_releases')
          .select('*')
          .limit(1);
        
        // Try admin access to profiles
        const { data: adminProfilesData, error: adminProfilesError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .limit(1);
        
        // Try admin access to admin_users
        const { data: adminUsersData, error: adminUsersError } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .limit(1);
        
        adminResults = {
          submissions: adminSubmissionsError ? 
            { error: adminSubmissionsError.message } : 
            { success: true, count: adminSubmissionsData?.length || 0 },
          press_releases: adminPressReleasesError ? 
            { error: adminPressReleasesError.message } : 
            { success: true, count: adminPressReleasesData?.length || 0 },
          profiles: adminProfilesError ? 
            { error: adminProfilesError.message } : 
            { success: true, count: adminProfilesData?.length || 0 },
          admin_users: adminUsersError ? 
            { error: adminUsersError.message } : 
            { success: true, count: adminUsersData?.length || 0 }
        };
      }
      
      // Check if any tables were accessible with either client
      const anonAccessible = Object.values(anonResults).some(result => 'success' in result);
      const adminAccessible = Object.values(adminResults).some(result => 'success' in result);
      
      if (anonAccessible || adminAccessible) {
        results.connection = {
          success: true,
          data: {
            connection_verified: true,
            message: 'Successfully connected to the database',
            anon_access: anonResults,
            admin_access: adminResults,
            access_level: anonAccessible ? 'anon' : (adminAccessible ? 'admin' : 'none')
          },
          error: null
        };
      } else {
        throw new Error('Could not access any tables with either anon or service role key');
      }
      
    } catch (error: any) {
      // If direct table queries fail, try a simple API check
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        results.connection = {
          success: true,
          data: {
            connection_verified: true,
            message: 'Supabase API is accessible but table access failed',
            api_status: response.status,
            error_details: error?.message || 'Unknown error'
          },
          error: null
        };
        
      } catch (finalError: any) {
        results.connection = {
          success: false,
          data: null,
          error: `Connection failed: ${error?.message || 'Unknown error'}`,
          details: 'Could not access the database tables. Check your credentials and permissions.'
        };
      }
    }
  } catch (error) {
    results.connection = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error during connection',
    };
  }

  return NextResponse.json(results);
}

export const dynamic = 'force-dynamic';