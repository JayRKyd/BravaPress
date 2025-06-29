import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    console.log('Looking up user by email:', email)
    
    // Create a direct client with the service role key
    // We know from memory that the service role key works with the tables
    const supabase = createDirectClient()
    
    // Try to find the user in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // Ignore not found error
      console.error('Error looking up profile:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }
    
    if (profileData) {
      console.log('Found user:', profileData)
      return NextResponse.json({ user: profileData })
    }
    
    // If not found in profiles, try to find in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }
    
    // Find the user with matching email
    const matchingUser = userData.users.find(user => user.email === email)
    
    if (matchingUser) {
      console.log('Found user in auth.users:', { id: matchingUser.id, email: matchingUser.email })
      return NextResponse.json({ 
        user: { 
          id: matchingUser.id, 
          email: matchingUser.email 
        } 
      })
    }
    
    // User not found
    console.log('User not found for email:', email)
    return NextResponse.json({ user: null })
    
  } catch (error) {
    console.error('Unexpected error in user lookup:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
