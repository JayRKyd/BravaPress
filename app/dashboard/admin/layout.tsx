import { Metadata } from 'next'
import AdminRoute from '@/components/auth/AdminRoute'

export const metadata: Metadata = {
  title: 'Admin Dashboard - BravaPress',
  description: 'Administrative control panel for BravaPress',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AdminRoute>
  )
} 