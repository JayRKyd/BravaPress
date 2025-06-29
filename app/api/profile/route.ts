import { NextResponse } from 'next/server';
import { createDirectClient } from '@/utils/supabase/server';
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
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Error fetching profile data' }, 
        { status: 500 }
      );
    }
    
    // Return the profile data
    return NextResponse.json({
      profile: profile || null,
      user: {
        id: session.user.id,
        email: session.user.email
      }
    });
    
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // First, check if the user is authenticated
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the profile data from the request
    const profileData = await request.json();
    
    // Use the service role client to bypass RLS issues
    const supabaseAdmin = createDirectClient();
    
    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Error updating profile data' }, 
        { status: 500 }
      );
    }
    
    // Return the updated profile
    return NextResponse.json({
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
