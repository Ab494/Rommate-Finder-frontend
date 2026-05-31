'use client'
import { useEffect, useState } from 'react'
import { Users, MapPin, Briefcase, Heart, MessageCircle, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { matchApi, messagingApi } from '@/lib/api'
import { MatchSuggestion, Match } from '@/types'
import { getInitials, formatCurrency, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-primary-600' : score >= 40 ? 'text-amber-600' : 'text-gray-400'
  const bg    = score >= 80 ? 'bg-emerald-50'   : score >= 60 ? 'bg-primary-50'   : score >= 40 ? 'bg-amber-50'   : 'bg-gray-50'
  const label = score >= 80 ? 'Excellent'        : score >= 60 ? 'Good'            : score >= 40 ? 'Fair'          : 'Low'
  return (
    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl ${bg} shrink-0`}>
      <span className={`text-xl font-bold ${color}`}>{score}</span>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  )
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-primary-500' : pct >= 40 ? 'bg-amber-500' : 'bg-gray-300'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-base', lg: 'w-16 h-16 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden shrink-0`}>
      {photoUrl
        ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        : <span>{getInitials(name)}</span>
      }
    </div>
  )
}

function SuggestionCard({ suggestion }: { suggestion: MatchSuggestion }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [messaging, setMessaging] = useState(false)

  const handleRequest = async () => {
    setRequesting(true)
    try {
      await matchApi.request(suggestion.user_id)
      toast.success(`Match request sent to ${suggestion.profile?.full_name}!`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed')
    } finally { setRequesting(false) }
  }

  const handleMessage = async () => {
    setMessaging(true)
    try {
      const res = await messagingApi.createConversation(suggestion.user_id)
      router.push(`/dashboard/chat/${res.data.id}`)
    } catch { toast.error('Could not start conversation') }
    finally { setMessaging(false) }
  }

  const profile = suggestion.profile
  if (!profile) return null

  return (
    <div className="card-hover p-5 animate-fade-in">
      <div className="flex items-start gap-4">
        <Avatar name={profile.full_name} photoUrl={profile.photo_url} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">{profile.full_name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 flex-wrap">
                {profile.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} className="text-primary-400" />{profile.occupation}
                  </span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-primary-400" />{profile.city}
                  </span>
                )}
              </div>
            </div>
            <ScoreRing score={Math.round(suggestion.score)} />
          </div>

          {profile.bio && (
            <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">{profile.bio}</p>
          )}

          {/* Compatibility breakdown */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-primary-600 font-medium mt-3 hover:text-primary-700 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'View'} compatibility breakdown
          </button>

          {expanded && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3 animate-fade-in">
              <ScoreBar label="Budget match"        value={suggestion.breakdown.budget}    max={25} />
              <ScoreBar label="Gender preference"   value={suggestion.breakdown.gender}    max={20} />
              <ScoreBar label="Lifestyle"           value={suggestion.breakdown.lifestyle} max={25} />
              <ScoreBar label="Location proximity"  value={suggestion.breakdown.location}  max={20} />
              <ScoreBar label="Lifestyle booleans"  value={suggestion.breakdown.booleans}  max={10} />
              <div className="pt-2 border-t border-gray-200 flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Total compatibility</span>
                <span className="font-bold text-primary-600">{Math.round(suggestion.score)}/100</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="btn-primary text-sm py-2 flex items-center gap-1.5"
            >
              {requesting ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} />}
              {requesting ? 'Sending...' : 'Request Match'}
            </button>
            <button
              onClick={handleMessage}
              disabled={messaging}
              className="btn-secondary text-sm py-2 flex items-center gap-1.5"
            >
              {messaging ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, currentUserId }: { match: Match; currentUserId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isUserA = match.user_a === currentUserId
  const other = isUserA ? match.user_b_profile : match.user_a_profile
  const otherId = isUserA ? match.user_b : match.user_a

  const handleMessage = async () => {
    setLoading(true)
    try {
      const res = await messagingApi.createConversation(otherId)
      router.push(`/dashboard/chat/${res.data.id}`)
    } catch { toast.error('Could not open chat') }
    finally { setLoading(false) }
  }

  const statusStyle = {
    accepted: 'badge-green',
    declined: 'badge-red',
    pending:  'badge-amber',
  }[match.status] || 'badge-gray'

  return (
    <div className="card-hover p-4 flex items-center gap-4">
      <Avatar name={other?.full_name || '?'} photoUrl={other?.photo_url} size="sm" />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{other?.full_name || 'Unknown'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{other?.city || 'Location unknown'}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-primary-600">{Math.round(match.score)}%</span>
        <span className={`badge ${statusStyle} capitalize`}>{match.status}</span>
        {match.status === 'accepted' && (
          <button
            onClick={handleMessage}
            disabled={loading}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />}
            Chat
          </button>
        )}
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const { user } = useAuthStore()
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [tab, setTab] = useState<'suggestions' | 'mine'>('suggestions')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (tab === 'suggestions') {
          const res = await matchApi.suggestions()
          setSuggestions(res.data.results || [])
        } else {
          const res = await matchApi.mine()
          setMyMatches(res.data.results || res.data || [])
        }
      } catch {
        toast.error('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [tab])

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Roommate Matches</h1>
          <p className="page-subtitle">Find compatible roommates based on your preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setTab('suggestions')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            tab === 'suggestions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Sparkles size={14} /> Suggestions
          {suggestions.length > 0 && tab === 'suggestions' && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold rounded-full px-1.5 py-0.5">
              {suggestions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('mine')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            tab === 'mine' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Heart size={14} /> My Matches
          {myMatches.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-xs font-bold rounded-full px-1.5 py-0.5">
              {myMatches.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="flex gap-4">
                <div className="skeleton w-16 h-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'suggestions' ? (
        suggestions.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <Users size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No suggestions yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Complete your profile and set your preferences to start getting matched with compatible roommates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <SuggestionCard key={s.user_id} suggestion={s} />
            ))}
          </div>
        )
      ) : (
        myMatches.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <Heart size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No matches yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Send match requests from the Suggestions tab to connect with compatible roommates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myMatches.map((m) => (
              <MatchCard key={m.id} match={m} currentUserId={user?.id ?? 0} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
