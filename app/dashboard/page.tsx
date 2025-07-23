"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FullPageLoading } from "@/components/ui/loading"
import { createClient } from "@/utils/supabase/client"

export default function DashboardPage() {
  const [pressReleases, setPressReleases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const supabase = createClient()
  
  // Fetch dashboard data directly from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Starting to fetch data')
        setIsLoading(true)
        setError(null)
        
        // Get the current user's session
        console.log('Dashboard: Checking for session')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Dashboard: Session check result:', { 
          hasSession: !!session, 
          user: session?.user ? { id: session.user.id, email: session.user.email } : null,
          error: sessionError
        })
        
        // At this point, we should always have a session due to middleware protection
        if (!session) {
          console.error('Dashboard: No session found despite middleware protection')
          throw new Error('Authentication required')
        }
        
        const userId = session.user.id
        
        // Fetch press releases for the authenticated user
        const { data: pressReleasesData, error: pressReleasesError } = await supabase
          .from('press_releases')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        
        if (pressReleasesError) {
          console.error('Error fetching press releases:', pressReleasesError)
          throw new Error(pressReleasesError.message)
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') { // Ignore not found error
          console.error('Error fetching profile:', profileError)
          throw new Error(profileError.message)
        }
        
        setPressReleases(pressReleasesData || [])
        setProfile(profileData || null)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
    
    // Set up real-time subscription for press releases
    const pressReleasesSubscription = supabase
      .channel('press_releases_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'press_releases'
      }, (payload) => {
        console.log('Press release change:', payload)
        fetchDashboardData()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(pressReleasesSubscription)
    }
  }, [supabase])

  if (isLoading) {
    return <FullPageLoading />
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/dashboard/new-release">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Press Release
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium mb-1">Error Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/dashboard/new-release">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Press Release
          </Button>
        </Link>
      </div>
      
      {profile && (
        <Card className="bg-primary/5 border-primary/10 w-full">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 w-full">
              <div className="w-full">
                <h2 className="text-lg font-medium">Welcome, {profile.full_name || profile.email || 'User'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.company ? `${profile.company}` : 'Harness the power of AI to publish your next press release—faster, smarter, and with greater impact.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-full">
        <CardHeader className="w-full">
          <CardTitle>Press Releases</CardTitle>
          <CardDescription>View and manage all your press releases</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search press releases..." className="pl-8" />
              </div>
              <div className="flex gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {pressReleases.map((release) => (
                <div key={release.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{release.title}</h3>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            release.status === "Published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : release.status === "Draft"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {release.status}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{release.date}</p>
                      <p className="text-sm line-clamp-2 mt-2">{release.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/dashboard/press-release/${release.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/press-release/${release.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {pressReleases.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No press releases found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first press release.
                  </p>
                  <Link href="/dashboard/new-release">
                    <Button>Create New Press Release</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
