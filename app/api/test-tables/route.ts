import { NextResponse } from 'next/server';
import { createDirectClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // Create a direct client with service role key
    const supabase = createDirectClient();
    
    // Get counts for all tables
    const [
      submissionsResult,
      pressReleasesResult,
      profilesResult,
      adminUsersResult
    ] = await Promise.all([
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('press_releases').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('admin_users').select('*', { count: 'exact', head: true })
    ]);
    
    // Return the results
    return NextResponse.json({
      success: true,
      tables: {
        submissions: {
          count: submissionsResult.count,
          error: submissionsResult.error?.message || null
        },
        press_releases: {
          count: pressReleasesResult.count,
          error: pressReleasesResult.error?.message || null
        },
        profiles: {
          count: profilesResult.count,
          error: profilesResult.error?.message || null
        },
        admin_users: {
          count: adminUsersResult.count,
          error: adminUsersResult.error?.message || null
        }
      }
    });
    
  } catch (error) {
    console.error('Error testing tables:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
