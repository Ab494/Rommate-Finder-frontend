'use client'
import { useEffect, useState } from 'react'
import { Users, MapPin, Briefcase, Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { matchApi, messagingApi } from '@/lib/api'
import { MatchSuggestion, Match } from '@/types'
import { getScoreColor, getScoreLabel, getAvatarUrl, formatCurrency, timeAgo } from '@/lib/utils'
import { useRouter } from 'next/navigation'

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span><span>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(value / max) * 100}%` }} />
      </div>
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
    <div className="card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={getAvatarUrl(profile)}
          alt={profile.full_name}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                {profile.occupation && <span className="flex items-center gap-1"><Briefcase size={12} />{profile.occupation}</span>}
                {profile.city && <span className="flex items-center gap-1"><MapPin size={12} />{profile.city}</span>}
              </div>
            </div>
            <div className={`badge ${getScoreColor(suggestion.score)} shrink-0`}>
              {suggestion.score}% · {getScoreLabel(suggestion.score)}
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{profile.bio}</p>
          )}

          {/* Score breakdown toggle */}
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-primary-600 mt-3 hover:underline">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'View'} compatibility breakdown
          </button>

          {expanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
              <ScoreBar label="Budget match" value={suggestion.breakdown.budget} max={25} />
              <ScoreBar label="Gender preference" value={suggestion.breakdown.gender} max={20} />
              <ScoreBar label="Lifestyle" value={suggestion.breakdown.lifestyle} max={25} />
              <ScoreBar label="Location proximity" value={suggestion.breakdown.location} max={20} />
              <ScoreBar label="Lifestyle booleans" value={suggestion.breakdown.booleans} max={10} />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleRequest} disabled={requesting} className="btn-primary text-sm py-1.5 flex items-center gap-1.5">
              <Heart size={13} /> {requesting ? 'Sending...' : 'Request Match'}
            </button>
            <button onClick={handleMessage} disabled={messaging} className="btn-secondary text-sm py-1.5 flex items-center gap-1.5">
              <MessageCircle size={13} /> {messaging ? '...' : 'Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, currentUserId }: { match: Match; currentUserId: number }) {
  const router = useRouter()
  const other = match.user_a === currentUserId ? match.user_b_profile : match.user_a_profile

  const handleMessage = async () => {
    try {
      const res = await messagingApi.createConversation(match.user_a === currentUserId ? match.user_b : match.user_a)
      router.push(`/dashboard/chat/${res.data.id}`)
    } catch { toast.error('Could not open chat') }
  }

  return (
    <div className="card flex items-center gap-4">
      <img src={getAvatarUrl(other)} alt={other.full_name} className="w-11 h-11 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{other.full_name}</p>
        <p className="text-xs text-gray-400">{other.city}</p>
      </div>
      <div className={`badge ${getScoreColor(match.score)}`}>{match.score}%</div>
      <span className={`badge ${match.status === 'accepted' ? 'bg-green-50 text-green-700' : match.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {match.status}
      </span>
      {match.status === 'accepted' && (
        <button onClick={handleMessage} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
          <MessageCircle size={12} /> Chat
        </button>
      )}
    </div>
  )
}

export default function MatchesPage() {
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
          setSuggestions(res.data.results)
        } else {
          const res = await matchApi.mine()
          setMyMatches(res.data.results || res.data)
        }
      } catch { toast.error('Failed to load matches') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [tab])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roommate Matches</h1>
        <p className="text-gray-500 text-sm mt-1">Find compatible roommates based on your preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        {(['suggestions', 'mine'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'suggestions' ? '✨ Suggestions' : '🤝 My Matches'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}</div>
      ) : tab === 'suggestions' ? (
        suggestions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No suggestions yet</p>
            <p className="text-sm">Complete your profile and preferences to get matched</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => <SuggestionCard key={s.user_id} suggestion={s} />)}
          </div>
        )
      ) : (
        myMatches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Heart size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No matches yet</p>
            <p className="text-sm">Send match requests from the suggestions tab</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myMatches.map((m) => (
              <MatchCard key={m.id} match={m} currentUserId={0} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
