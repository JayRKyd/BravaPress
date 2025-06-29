import { createClient } from './server'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Gets the current user's profile from the database
 * @returns The user's profile or null if not authenticated
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient(cookies())
  
  try {
    // First check if the user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return null
    }
    
    // Fetch the profile using the user's ID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (error || !data) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getCurrentProfile:', error)
    return null
  }
}

/**
 * Updates the current user's profile
 * @param profile The profile data to update
 * @returns The updated profile or null if the update failed
 */
export async function updateProfile(
  profile: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> {
  const supabase = createClient(cookies())
  
  try {
    // First check if the user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return null
    }
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return null
  }
}
