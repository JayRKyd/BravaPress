import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    url,
    hasAnonKey: !!anonKey,
    anonKeyPrefix: anonKey ? anonKey.substring(0, 10) : null,
    hasServiceRole: !!serviceRole,
    serviceRolePrefix: serviceRole ? serviceRole.substring(0, 10) : null,
    allEnvKeys: Object.keys(process.env).filter((key) => key.toUpperCase().includes('SUPABASE')),
  })
}