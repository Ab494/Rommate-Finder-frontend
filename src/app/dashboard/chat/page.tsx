'use client'
import { useEffect, useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { messagingApi } from '@/lib/api'
import { Conversation } from '@/types'
import { timeAgo, getAvatarUrl, cn } from '@/lib/utils'

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    messagingApi.conversations()
      .then((res) => setConversations(res.data))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = conversations.filter((c) =>
    c.other_participant?.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse h-20" />
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm">Send a message from a listing or match</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv) => {
            const other = conv.other_participant
            return (
              <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-card">
                  <div className="relative shrink-0">
                    <img
                      src={other ? getAvatarUrl(other) : `https://api.dicebear.com/7.x/initials/svg?seed=U`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn('font-medium text-gray-900', conv.unread_count > 0 && 'font-semibold')}>
                        {other?.full_name || 'Unknown User'}
                      </p>
                      {conv.last_message && (
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo(conv.last_message.created_at)}</span>
                      )}
                    </div>
                    <p className={cn('text-sm truncate mt-0.5', conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400')}>
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
