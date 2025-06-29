'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading'
import { Profile } from '@/utils/supabase/profile'

export default function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError(null)
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setError('You must be logged in to view your profile')
          return
        }
        
        // Get the user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error loading profile:', error)
          setError('Failed to load profile')
          return
        }
        
        setProfile(data)
      } catch (err) {
        console.error('Error in loadProfile:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [supabase])

  const updateProfile = async () => {
    if (!profile) return
    
    try {
      setUpdating(true)
      setMessage(null)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
      
      if (error) {
        console.error('Error updating profile:', error)
        setMessage({ type: 'error', text: 'Failed to update profile' })
        return
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      console.error('Error in updateProfile:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Email
          </label>
          <div className="text-foreground">
            {profile?.email}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Account Created
          </label>
          <div className="text-foreground">
            {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            onClick={updateProfile}
            disabled={updating}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <LoadingSpinner className="inline-block mr-2 h-4 w-4" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
