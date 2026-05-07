'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Users, MessageCircle, Bell, User, ShieldCheck, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { notificationApi } from '@/lib/api'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/listings', label: 'Listings', icon: Home },
  { href: '/dashboard/matches', label: 'Matches', icon: Users },
  { href: '/dashboard/chat', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isAuthenticated, logout } = useAuthStore()
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    notificationApi.unreadCount().then((res) => setUnread(res.data.unread_count)).catch(() => {})
  }, [pathname])

  const handleLogout = () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) import('@/lib/api').then(({ authApi }) => authApi.logout(refresh).catch(() => {}))
    logout()
    router.push('/auth/login')
  }

  if (!isAuthenticated) return null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">🏠</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Roommate Finder</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={cn('sidebar-link', pathname.startsWith(href) && 'active')}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Notifications' && unread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        ))}

        {user?.is_staff && (
          <Link
            href="/dashboard/admin"
            onClick={() => setSidebarOpen(false)}
            className={cn('sidebar-link', pathname.startsWith('/dashboard/admin') && 'active')}
          >
            <ShieldCheck size={18} />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {profile?.full_name ? getInitials(profile.full_name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white shadow-xl flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-900">Roommate Finder</span>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
