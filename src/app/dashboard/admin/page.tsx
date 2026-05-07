'use client'
import { useEffect, useState } from 'react'
import { Users, Home, Heart, Flag, ShieldCheck, ShieldOff, CheckCircle, XCircle, Megaphone, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Listing } from '@/types'
import { formatCurrency, timeAgo } from '@/lib/utils'

interface Stats {
  users: { total: number; verified: number; banned: number; seekers: number; listers: number }
  listings: { total: number; active: number; flagged: number; pending_approval: number }
  matches: { total: number; accepted: number; pending: number; avg_score: number }
  notifications: { unread: number }
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [flagged, setFlagged] = useState<Listing[]>([])
  const [tab, setTab] = useState<'overview' | 'users' | 'listings' | 'broadcast'>('overview')
  const [loading, setLoading] = useState(true)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastChannel, setBroadcastChannel] = useState('in_app')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user?.is_staff) { router.push('/dashboard/listings'); return }
    Promise.all([adminApi.stats(), adminApi.users(), adminApi.flaggedListings()])
      .then(([statsRes, usersRes, flaggedRes]) => {
        setStats(statsRes.data)
        setUsers(usersRes.data.results || usersRes.data)
        setFlagged(flaggedRes.data.results || flaggedRes.data)
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleBan = async (id: number, ban: boolean) => {
    try {
      ban ? await adminApi.banUser(id) : await adminApi.unbanUser(id)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_banned: ban, is_active: !ban } : u))
      toast.success(ban ? 'User banned' : 'User unbanned')
    } catch { toast.error('Action failed') }
  }

  const handleListingAction = async (id: number, approve: boolean) => {
    try {
      approve ? await adminApi.approveListing(id) : await adminApi.rejectListing(id)
      setFlagged((prev) => prev.filter((l) => l.id !== id))
      toast.success(approve ? 'Listing approved' : 'Listing rejected')
    } catch { toast.error('Action failed') }
  }

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setSending(true)
    try {
      await adminApi.broadcast(broadcastMsg, broadcastChannel)
      toast.success('Broadcast sent to all users!')
      setBroadcastMsg('')
    } catch { toast.error('Broadcast failed') }
    finally { setSending(false) }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24" />)}</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <ShieldCheck size={20} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform management and moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6 flex-wrap">
        {(['overview', 'users', 'listings', 'broadcast'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : t === 'listings' ? '🏠 Listings' : '📢 Broadcast'}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.users.total} sub={`${stats.users.verified} verified`} color="text-blue-600" />
            <StatCard label="Active listings" value={stats.listings.active} sub={`${stats.listings.flagged} flagged`} color="text-green-600" />
            <StatCard label="Total matches" value={stats.matches.total} sub={`${stats.matches.accepted} accepted`} color="text-purple-600" />
            <StatCard label="Avg match score" value={`${stats.matches.avg_score}%`} sub={`${stats.matches.pending} pending`} color="text-orange-600" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Seekers" value={stats.users.seekers} color="text-gray-700" />
            <StatCard label="Listers" value={stats.users.listers} color="text-gray-700" />
            <StatCard label="Banned users" value={stats.users.banned} color="text-red-600" />
            <StatCard label="Pending approval" value={stats.listings.pending_approval} color="text-yellow-600" />
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-50 text-blue-700 capitalize">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_banned ? 'bg-red-50 text-red-700' : u.is_verified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.is_banned ? 'Banned' : u.is_verified ? 'Verified' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{timeAgo(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleBan(u.id, !u.is_banned)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${u.is_banned ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                      >
                        {u.is_banned ? <><ShieldOff size={11} /> Unban</> : <><ShieldCheck size={11} /> Ban</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'listings' && (
        flagged.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Flag size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No flagged listings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flagged.map((listing) => (
              <div key={listing.id} className="card flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                  {listing.photos[0] ? <img src={listing.photos[0].image_url} className="w-full h-full object-cover rounded-lg" alt="" /> : '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.area}, {listing.city} · {formatCurrency(listing.rent)}/mo</p>
                  <p className="text-xs text-gray-400 mt-1">Posted by user #{listing.owner} · {timeAgo(listing.created_at)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleListingAction(listing.id, true)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button onClick={() => handleListingAction(listing.id, false)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'broadcast' && (
        <div className="card max-w-xl">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Megaphone size={18} /> Broadcast Message</h2>
          <p className="text-sm text-gray-500 mb-4">Send a notification to all active users on the platform.</p>
          <div className="space-y-4">
            <div>
              <label className="label">Message</label>
              <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} rows={4} placeholder="Write your message here..." className="input resize-none" />
            </div>
            <div>
              <label className="label">Channel</label>
              <select value={broadcastChannel} onChange={(e) => setBroadcastChannel(e.target.value)} className="input">
                <option value="in_app">In-app only</option>
                <option value="email">Email only</option>
                <option value="sms">SMS only</option>
                <option value="both">SMS + Email</option>
              </select>
            </div>
            <button onClick={handleBroadcast} disabled={sending || !broadcastMsg.trim()} className="btn-primary flex items-center gap-2">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Megaphone size={15} />}
              Send to all users
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
