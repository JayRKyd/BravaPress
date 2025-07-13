import { NextResponse } from 'next/server';

export async function GET() {
  // Only show this info in development or with a special header for security
  const envDebug = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    // Show first few characters for verification (safe)
    supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'undefined',
    supabaseKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  };

  return NextResponse.json(envDebug);
} 