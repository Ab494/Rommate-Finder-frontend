'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Users, MessageCircle, Bell, User, ShieldCheck, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { notificationApi } from '@/lib/api'
import { cn, getInitials, getAvatarUrl } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/listings',      label: 'Listings',       icon: Home,          desc: 'Browse rooms' },
  { href: '/dashboard/matches',       label: 'Matches',        icon: Users,         desc: 'Find roommates' },
  { href: '/dashboard/chat',          label: 'Messages',       icon: MessageCircle, desc: 'Your chats' },
  { href: '/dashboard/notifications', label: 'Notifications',  icon: Bell,          desc: 'Updates' },
  { href: '/dashboard/profile',       label: 'Profile',        icon: User,          desc: 'Your account' },
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
    notificationApi.unreadCount()
      .then((res) => setUnread(res.data.unread_count))
      .catch(() => {})
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
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
          <span className="text-white font-bold text-base">R</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm tracking-tight">Roommate Finder</p>
          <p className="text-xs text-sidebar-text capitalize">{user?.role} account</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="section-title mb-3">Main menu</p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unread > 0 && (
                <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
              {isActive && <ChevronRight size={14} className="text-sidebar-activeText shrink-0" />}
            </Link>
          )
        })}

        {user?.is_staff && (
          <>
            <div className="pt-4 pb-1">
              <p className="section-title">Admin</p>
            </div>
            <Link
              href="/dashboard/admin"
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-link', pathname.startsWith('/dashboard/admin') && 'active')}
            >
              <ShieldCheck size={18} className="shrink-0" />
              <span className="flex-1">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-hover transition-colors cursor-pointer mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(profile?.full_name || user?.email || '?')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-xs text-sidebar-text truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-sidebar-text hover:text-red-400 transition-colors w-full px-2 py-2 rounded-lg hover:bg-sidebar-hover mt-1"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar-bg shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-sidebar-bg flex flex-col shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-sidebar-text hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-sidebar-bg border-b border-sidebar-border">
          <button onClick={() => setSidebarOpen(true)} className="text-sidebar-text hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-bold text-white text-sm">Roommate Finder</span>
          </div>
          {unread > 0 && (
            <Link href="/dashboard/notifications" className="ml-auto">
              <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
