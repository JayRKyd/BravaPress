import { NextResponse } from 'next/server';
import { createDirectClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // First, check if the user is authenticated
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use the service role client to bypass RLS issues
    const supabaseAdmin = createDirectClient();
    
    // Fetch press releases for the current user
    const { data: pressReleases, error: pressReleasesError } = await supabaseAdmin
      .from('press_releases')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (pressReleasesError) {
      console.error('Error fetching press releases:', pressReleasesError);
      return NextResponse.json(
        { error: 'Error fetching dashboard data' }, 
        { status: 500 }
      );
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Return the dashboard data
    return NextResponse.json({
      pressReleases: pressReleases || [],
      profile: profile || null,
      user: {
        id: session.user.id,
        email: session.user.email
      }
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
