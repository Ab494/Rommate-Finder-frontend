'use client'
import { useEffect, useState } from 'react'
import { Camera, Save, Loader2, Star, MapPin, Briefcase, User, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { profileApi } from '@/lib/api'
import { Profile, Preference } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { getInitials, formatCurrency } from '@/lib/utils'

const SLEEP_OPTIONS = [
  { value: 'early',    label: '🌅 Early bird' },
  { value: 'night',   label: '🦉 Night owl' },
  { value: 'flexible',label: '😊 Flexible' },
]
const CLEANLINESS = [
  { value: 'very_clean', label: '✨ Very clean' },
  { value: 'clean',      label: '🧹 Clean' },
  { value: 'moderate',   label: '😌 Moderate' },
  { value: 'messy',      label: '🤷 Messy' },
]
const NOISE = [
  { value: 'quiet',    label: '🤫 Quiet' },
  { value: 'moderate', label: '🎵 Moderate' },
  { value: 'loud',     label: '🎉 Lively' },
]
const GENDER_PREF = [
  { value: 'any',    label: 'Any gender' },
  { value: 'male',   label: 'Male only' },
  { value: 'female', label: 'Female only' },
]

export default function ProfilePage() {
  const { setProfile } = useAuthStore()
  const [profile, setLocalProfile] = useState<Profile | null>(null)
  const [prefs, setPrefs] = useState<Preference | null>(null)
  const [tab, setTab] = useState<'profile' | 'preferences'>('profile')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    Promise.all([profileApi.getMe(), profileApi.getPreferences()])
      .then(([pRes, prefRes]) => {
        setLocalProfile(pRes.data)
        setFirstName(pRes.data.first_name || '')
        setLastName(pRes.data.last_name || '')
        setPrefs(prefRes.data)
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await profileApi.updateMe({
        first_name: firstName,
        last_name: lastName,
        bio: profile.bio,
        occupation: profile.occupation,
        city: profile.city,
        area: profile.area,
      })
      setLocalProfile(res.data)
      setProfile(res.data)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    if (!prefs) return
    setSaving(true)
    try {
      await profileApi.updatePreferences(prefs)
      toast.success('Preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}
      </div>
    )
  }

  if (!profile || !prefs) return null

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profile.email

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your profile and roommate preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl2 p-6 mb-6 text-white">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-2 border-white/30">
              {profile.photo_url
                ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                : <span>{getInitials(displayName)}</span>
              }
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-accent-600 transition-colors">
              <Camera size={13} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{displayName}</h2>
            <div className="flex items-center gap-3 text-primary-200 text-sm mt-1 flex-wrap">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />{profile.city}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />{profile.occupation}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-accent-400 mt-2 text-sm font-medium">
              <Star size={13} fill="currentColor" />
              <span>{(profile.average_rating ?? 0).toFixed(1)}</span>
              <span className="text-primary-300 font-normal">({profile.total_reviews ?? 0} reviews)</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className={`badge ${profile.is_verified ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' : 'bg-white/10 text-primary-200 border-white/20'}`}>
              {profile.is_verified ? '✓ Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'profile' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={14} /> Profile
        </button>
        <button
          onClick={() => setTab('preferences')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'preferences' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={14} /> Preferences
        </button>
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="input"
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Wanjiku"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Occupation</label>
            <input
              value={profile.occupation || ''}
              onChange={(e) => setLocalProfile({ ...profile, occupation: e.target.value })}
              placeholder="e.g. Software Engineer"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input
                value={profile.city || ''}
                onChange={(e) => setLocalProfile({ ...profile, city: e.target.value })}
                placeholder="Nairobi"
                className="input"
              />
            </div>
            <div>
              <label className="label">Area</label>
              <input
                value={profile.area || ''}
                onChange={(e) => setLocalProfile({ ...profile, area: e.target.value })}
                placeholder="Westlands"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setLocalProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="Tell potential roommates about yourself — your lifestyle, interests, working hours..."
              className="input resize-none"
            />
          </div>

          <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save profile
          </button>
        </div>
      )}

      {/* Preferences tab */}
      {tab === 'preferences' && (
        <div className="card space-y-7">

          {/* Budget */}
          <div>
            <label className="label">Monthly budget (KES)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Minimum</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(prefs.min_budget)}</span>
                </div>
                <input
                  type="range" min={0} max={100000} step={1000}
                  value={prefs.min_budget}
                  onChange={(e) => setPrefs({ ...prefs, min_budget: Number(e.target.value) })}
                  className="w-full accent-primary-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Maximum</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(prefs.max_budget)}</span>
                </div>
                <input
                  type="range" min={0} max={100000} step={1000}
                  value={prefs.max_budget}
                  onChange={(e) => setPrefs({ ...prefs, max_budget: Number(e.target.value) })}
                  className="w-full accent-primary-600"
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Gender preference */}
          <div>
            <label className="label">Preferred roommate gender</label>
            <div className="flex gap-2 flex-wrap">
              {GENDER_PREF.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, preferred_gender: opt.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    prefs.preferred_gender === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep schedule */}
          <div>
            <label className="label">Sleep schedule</label>
            <div className="flex gap-2 flex-wrap">
              {SLEEP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, sleep_schedule: opt.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    prefs.sleep_schedule === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cleanliness */}
          <div>
            <label className="label">Cleanliness level</label>
            <div className="flex gap-2 flex-wrap">
              {CLEANLINESS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, cleanliness: opt.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    prefs.cleanliness === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Noise level */}
          <div>
            <label className="label">Noise level preference</label>
            <div className="flex gap-2 flex-wrap">
              {NOISE.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, noise_tolerance: opt.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    prefs.noise_tolerance === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Boolean prefs */}
          <div>
            <label className="label">Lifestyle preferences</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['smoking_ok', '🚬', 'Smoking OK'],
                ['pets_ok',    '🐾', 'Pets OK'],
                ['guests_ok',  '👥', 'Guests OK'],
              ].map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, [key]: !prefs[key as keyof Preference] })}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 font-medium transition-all ${
                    prefs[key as keyof Preference]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="label mb-0">Max search distance</label>
              <span className="text-sm font-semibold text-primary-600">{prefs.max_distance_km} km</span>
            </div>
            <input
              type="range" min={1} max={50}
              value={prefs.max_distance_km}
              onChange={(e) => setPrefs({ ...prefs, max_distance_km: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          <button onClick={savePreferences} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save preferences
          </button>
        </div>
      )}
    </div>
  )
}
