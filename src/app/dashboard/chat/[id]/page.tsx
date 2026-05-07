'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { messagingApi } from '@/lib/api'
import { Message } from '@/types'
import { useChat } from '@/hooks/useChat'
import { useAuthStore } from '@/store/authStore'
import { timeAgo, getAvatarUrl, cn } from '@/lib/utils'

export default function ChatRoomPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const convId = Number(id)

  const [otherName, setOtherName] = useState('')
  const [otherPhoto, setOtherPhoto] = useState('')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, setMessages, sendMessage, connected } = useChat(convId)

  // Load history
  useEffect(() => {
    messagingApi.messages(convId)
      .then((res) => {
        setMessages(res.data.results || res.data)
        messagingApi.markRead(convId).catch(() => {})
      })
      .catch(() => toast.error('Failed to load messages'))
  }, [convId])

  // Load conversation info
  useEffect(() => {
    messagingApi.conversations().then((res) => {
      const conv = res.data.find((c: any) => c.id === convId)
      if (conv?.other_participant) {
        setOtherName(conv.other_participant.full_name)
        setOtherPhoto(getAvatarUrl(conv.other_participant))
      }
    }).catch(() => {})
  }, [convId])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = input.trim()
    if (!content) return
    setInput('')
    setSending(true)

    // Try WebSocket first, fall back to REST
    if (connected) {
      sendMessage(content)
    } else {
      try {
        const res = await messagingApi.send(convId, content)
        setMessages((prev) => [...prev, res.data])
      } catch { toast.error('Failed to send message') }
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-48px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100 rounded-t-xl shadow-sm">
        <button onClick={() => router.push('/dashboard/chat')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        {otherPhoto && <img src={otherPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{otherName || 'Chat'}</p>
          <div className="flex items-center gap-1 text-xs">
            {connected
              ? <><Wifi size={10} className="text-green-500" /><span className="text-green-500">Connected</span></>
              : <><WifiOff size={10} className="text-gray-400" /><span className="text-gray-400">Connecting...</span></>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender === user?.id
          const showAvatar = !isMine && (i === 0 || messages[i - 1].sender !== msg.sender)

          return (
            <div key={msg.id || i} className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
              {!isMine && (
                <div className="w-7 h-7 shrink-0 mt-auto">
                  {showAvatar && otherPhoto && (
                    <img src={otherPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                  )}
                </div>
              )}
              <div className={cn('max-w-[70%] group')}>
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isMine
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
                <p className={cn('text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isMine ? 'text-right' : 'text-left')}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="input flex-1 resize-none min-h-[42px] max-h-32"
            style={{ height: Math.min(32 + input.split('\n').length * 20, 128) }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="btn-primary p-2.5 shrink-0 disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
