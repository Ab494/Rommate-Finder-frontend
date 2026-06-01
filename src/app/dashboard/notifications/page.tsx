'use client'
import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Heart, MessageCircle, Star, Home, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationApi } from '@/lib/api'
import { Notification } from '@/types'
import { timeAgo, cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  match_request:  { icon: Heart,         color: 'text-pink-600',   bg: 'bg-pink-50' },
  match_accepted: { icon: Heart,         color: 'text-emerald-600',bg: 'bg-emerald-50' },
  new_message:    { icon: MessageCircle, color: 'text-primary-600',bg: 'bg-primary-50' },
  review:         { icon: Star,          color: 'text-amber-600',  bg: 'bg-amber-50' },
  listing:        { icon: Home,          color: 'text-purple-600', bg: 'bg-purple-50' },
  system:         { icon: AlertCircle,   color: 'text-gray-500',   bg: 'bg-gray-100' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = () => {
    setLoading(true)
    const params = filter === 'unread' ? { unread: 'true' } : {}
    notificationApi.list(params)
      .then((res) => setNotifications(res.data.results || res.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifications() }, [filter])

  const markRead = async (id: number) => {
    try {
      await notificationApi.markRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all read')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? (
              <span className="text-primary-600 font-semibold">{unreadCount} unread</span>
            ) : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-3 border border-gray-100">
              <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <Bell size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here when you get matches, messages, or reviews.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
            const Icon = config.icon
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead(notif.id)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all',
                  notif.is_read
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-primary-50/40 border-primary-100 hover:border-primary-200 cursor-pointer'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                  <Icon size={17} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-relaxed', notif.is_read ? 'text-gray-600' : 'text-gray-900 font-medium')}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{timeAgo(notif.sent_at)}</span>
                    <span className={cn('badge text-xs capitalize', config.bg, config.color)}>
                      {notif.type.replace(/_/g, ' ')}
                    </span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full ml-auto shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
