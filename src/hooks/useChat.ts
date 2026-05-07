'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Message } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:80'

export function useChat(conversationId: number) {
  const [messages, setMessages] = useState<Message[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    const ws = new WebSocket(`${WS_URL}/ws/chat/${conversationId}/?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      // Reconnect after 3 seconds
      setTimeout(connect, 3000)
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        setMessages((prev) => [...prev, {
          id: data.id,
          conversation: conversationId,
          sender: data.sender_id,
          sender_name: data.sender_name,
          sender_photo: null,
          content: data.content,
          is_read: false,
          created_at: data.created_at,
        }])
      }
    }
  }, [conversationId])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }))
    }
  }, [])

  return { messages, setMessages, sendMessage, connected }
}
