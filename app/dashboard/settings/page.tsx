"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { FullPageLoading } from "@/components/ui/loading"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    company: '',
    phone: '',
    website: ''
  })
  const [emailPreferences, setEmailPreferences] = useState({
    statusUpdates: true,
    distributionReports: true
  })
  
  // Fetch profile data directly from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No session found, using guest mode')
          // Set up guest profile data
          setProfile({
            full_name: 'Guest User',
            email: 'guest@example.com',
            company: 'Guest Company',
            phone: '(555) 123-4567',
            website: 'example.com'
          })
          setIsLoading(false)
          return
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') { // Ignore not found error
          console.error('Error fetching profile:', profileError)
          throw new Error(profileError.message)
        }
        
        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            email: session.user.email || '',
            company: profileData.company || '',
            phone: profileData.phone || '',
            website: profileData.website || ''
          })
          
          // Set email preferences if they exist
          if (profileData.email_preferences) {
            try {
              const preferences = typeof profileData.email_preferences === 'string' 
                ? JSON.parse(profileData.email_preferences)
                : profileData.email_preferences
                
              setEmailPreferences({
                statusUpdates: preferences.statusUpdates ?? true,
                distributionReports: preferences.distributionReports ?? true
              })
            } catch (e) {
              console.error('Error parsing email preferences:', e)
            }
          }
        }
        
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfileData()
  }, [])
  
  // Handle form submission directly with Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      
      const supabase = createClient()
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // In guest mode, just show a toast notification
        toast({
          title: "Guest Mode",
          description: "Changes cannot be saved in guest mode. Please sign in to save changes.",
          variant: "destructive"
        })
        setIsSaving(false)
        return
      }
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: profile.full_name,
          company: profile.company,
          phone: profile.phone,
          website: profile.website,
          email_preferences: JSON.stringify(emailPreferences),
          updated_at: new Date().toISOString()
        })
      
      if (updateError) {
        throw new Error(updateError.message || 'Failed to update profile')
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
      
    } catch (err) {
      console.error('Error updating profile:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update profile'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfile((prev: any) => ({
      ...prev,
      [id]: value
    }))
  }
  
  // Handle switch changes
  const handleSwitchChange = (id: string, checked: boolean) => {
    setEmailPreferences((prev: any) => ({
      ...prev,
      [id]: checked
    }))
  }
  
  if (isLoading) {
    return <FullPageLoading />
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium mb-1">Error Loading Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name" 
                value={profile.full_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input 
              id="company" 
              value={profile.company}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={profile.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                value={profile.website}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Manage your email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Press Release Status Updates</p>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when your press release status changes
              </p>
            </div>
            <Switch 
              id="statusUpdates"
              checked={emailPreferences.statusUpdates}
              onCheckedChange={(checked) => handleSwitchChange('statusUpdates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Distribution Reports</p>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when distribution reports are available
              </p>
            </div>
            <Switch 
              id="distributionReports"
              checked={emailPreferences.distributionReports}
              onCheckedChange={(checked) => handleSwitchChange('distributionReports', checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
