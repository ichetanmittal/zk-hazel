'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FileText,
  Folder,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
  Users,
} from 'lucide-react'

interface SidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const role = user?.role

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = {
    BROKER: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/deals', label: 'All Deals', icon: FileText },
      { href: '/dashboard/deals/new', label: 'New Deal', icon: PlusCircle },
      { href: '/dashboard/parties', label: 'Parties', icon: Users },
    ],
    BUYER: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/deals', label: 'My Deals', icon: FileText },
      { href: '/dashboard/data-room', label: 'Data Room', icon: Folder },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    ],
    SELLER: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/deals', label: 'My Deals', icon: FileText },
      { href: '/dashboard/data-room', label: 'Data Room', icon: Folder },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    ],
  }

  const items = navItems[role as keyof typeof navItems] || navItems.BUYER

  const getRoleBadge = () => {
    const colors = {
      BUYER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      SELLER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      BROKER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }
    return colors[role as keyof typeof colors] || colors.BUYER
  }

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Hazel Trade
          </h1>
        </Link>
        <Badge className={`mt-2 ${getRoleBadge()}`}>
          {role}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Main
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Account
          </p>
          <Link href="/dashboard/notifications">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === '/dashboard/notifications'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="flex-1">Notifications</span>
            </div>
          </Link>
          <Link href="/dashboard/settings">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === '/dashboard/settings'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.companies?.name}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
