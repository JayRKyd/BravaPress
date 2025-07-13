"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { UserNav } from "@/components/user-nav"
import { LayoutDashboard, PlusCircle, CreditCard, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    // For the main dashboard route, only match exactly
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    // For other routes, match exactly or with sub-paths
    return pathname === path || pathname.startsWith(path + "/")
  }

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith('/dashboard/admin')

  // Navigation items
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "New Release",
      href: "/dashboard/new-release",
      icon: PlusCircle,
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  // If it's an admin route, render without sidebar
  if (isAdminRoute) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <header className="sticky top-16 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 w-full">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <span className="h-6 w-6 text-primary-foreground font-bold text-sm flex items-center justify-center">A</span>
            </div>
            <h1 className="text-xl font-bold">BravaPress Admin</h1>
          </div>
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="p-6 w-full max-w-full">{children}</main>
      </div>
    )
  }

  // Regular dashboard layout with fixed sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col h-full pt-5 bg-white border-r">
          {/* Navigation */}
          <nav className="px-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b sticky top-16 z-10">
          <div className="flex items-center justify-between h-16 px-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1">
                  <span className="h-6 w-6 text-primary-foreground font-bold text-sm flex items-center justify-center">D</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              </Link>
            <UserNav />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayoutContent>
      {children}
    </DashboardLayoutContent>
  )
}

