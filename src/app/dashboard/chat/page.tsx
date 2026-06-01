'use client'
import { useEffect, useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { messagingApi } from '@/lib/api'
import { Conversation } from '@/types'
import { timeAgo, getInitials, cn } from '@/lib/utils'

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    messagingApi.conversations()
      .then((res) => setConversations(res.data.results || res.data || []))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = conversations.filter((c) =>
    c.other_participant?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">
          {conversations.length === 0 ? 'No conversations yet' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100">
              <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <MessageCircle size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {search ? 'No conversations found' : 'No conversations yet'}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            {search ? 'Try a different search term.' : 'Start a conversation from a listing or match request.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv) => {
            const other = conv.other_participant
            const name = other?.full_name || 'Unknown User'
            return (
              <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
                <div className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border',
                  conv.unread_count > 0
                    ? 'bg-primary-50/60 border-primary-100 hover:bg-primary-50'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-card'
                )}>
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm overflow-hidden">
                      {other?.photo_url
                        ? <img src={other.photo_url} alt={name} className="w-full h-full object-cover" />
                        : <span>{getInitials(name)}</span>
                      }
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                      )}>
                        {name}
                      </p>
                      {conv.last_message && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {timeAgo(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      'text-sm truncate mt-0.5',
                      conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'
                    )}>
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
