'use client'

import { Suspense } from 'react'
import UserProfile from '@/components/profile/UserProfile'
import { FullPageLoading } from '@/components/ui/loading'

export default function ProfilePage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <Suspense fallback={<FullPageLoading />}>
        <UserProfile />
      </Suspense>
    </div>
  )
}
