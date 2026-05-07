'use client'
import { useEffect, useState } from 'react'
import { Camera, Save, Loader2, Star, MapPin, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { profileApi } from '@/lib/api'
import { Profile, Preference } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { getInitials, formatCurrency } from '@/lib/utils'

const SLEEP_OPTIONS = [{ value: 'early', label: '🌅 Early bird (before 10pm)' }, { value: 'night', label: '🦉 Night owl (after midnight)' }, { value: 'flexible', label: '😊 Flexible' }]
const CLEANLINESS = [{ value: 'very_clean', label: '✨ Very clean' }, { value: 'clean', label: '🧹 Clean' }, { value: 'relaxed', label: '😌 Relaxed' }]
const NOISE = [{ value: 'quiet', label: '🤫 Quiet' }, { value: 'moderate', label: '🎵 Moderate' }, { value: 'lively', label: '🎉 Lively' }]
const GENDER_PREF = [{ value: 'any', label: 'Any gender' }, { value: 'male', label: 'Male only' }, { value: 'female', label: 'Female only' }]

export default function ProfilePage() {
  const { setProfile } = useAuthStore()
  const [profile, setLocalProfile] = useState<Profile | null>(null)
  const [prefs, setPrefs] = useState<Preference | null>(null)
  const [tab, setTab] = useState<'profile' | 'preferences'>('profile')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([profileApi.getMe(), profileApi.getPreferences()])
      .then(([pRes, prefRes]) => {
        setLocalProfile(pRes.data)
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
        full_name: profile.full_name,
        bio: profile.bio,
        gender: profile.gender,
        age: profile.age,
        occupation: profile.occupation,
        city: profile.city,
        area: profile.area,
      })
      setLocalProfile(res.data)
      setProfile(res.data)
      toast.success('Profile saved!')
    } catch { toast.error('Failed to save profile') }
    finally { setSaving(false) }
  }

  const savePreferences = async () => {
    if (!prefs) return
    setSaving(true)
    try {
      await profileApi.updatePreferences(prefs)
      toast.success('Preferences saved!')
    } catch { toast.error('Failed to save preferences') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-20" />)}</div>
  if (!profile || !prefs) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and roommate preferences</p>
      </div>

      {/* Profile header */}
      <div className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold overflow-hidden">
              {profile.photo_url
                ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                : getInitials(profile.full_name)}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {profile.city && <span className="flex items-center gap-1"><MapPin size={12} />{profile.city}</span>}
              {profile.occupation && <span className="flex items-center gap-1"><Briefcase size={12} />{profile.occupation}</span>}
            </div>
            <div className="flex items-center gap-1 text-yellow-500 mt-1 text-sm">
              <Star size={13} fill="currentColor" />
              <span>{profile.average_rating.toFixed(1)}</span>
              <span className="text-gray-400">({profile.total_reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        {(['profile', 'preferences'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'profile' ? '👤 Profile' : '⚙️ Preferences'}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="card space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input value={profile.full_name} onChange={(e) => setLocalProfile({ ...profile, full_name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Age</label>
              <input value={profile.age || ''} onChange={(e) => setLocalProfile({ ...profile, age: Number(e.target.value) })} type="number" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Occupation</label>
            <input value={profile.occupation} onChange={(e) => setLocalProfile({ ...profile, occupation: e.target.value })} placeholder="e.g. Software Engineer" className="input" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select value={profile.gender} onChange={(e) => setLocalProfile({ ...profile, gender: e.target.value })} className="input">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input value={profile.city} onChange={(e) => setLocalProfile({ ...profile, city: e.target.value })} placeholder="Nairobi" className="input" />
            </div>
            <div>
              <label className="label">Area</label>
              <input value={profile.area} onChange={(e) => setLocalProfile({ ...profile, area: e.target.value })} placeholder="Westlands" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea value={profile.bio} onChange={(e) => setLocalProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell potential roommates about yourself..." className="input resize-none" />
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save profile
          </button>
        </div>
      ) : (
        <div className="card space-y-6">
          <div>
            <label className="label">Budget range (KES/month)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Min: {formatCurrency(prefs.min_budget)}</p>
                <input type="range" min={0} max={100000} step={1000} value={prefs.min_budget}
                  onChange={(e) => setPrefs({ ...prefs, min_budget: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Max: {formatCurrency(prefs.max_budget)}</p>
                <input type="range" min={0} max={100000} step={1000} value={prefs.max_budget}
                  onChange={(e) => setPrefs({ ...prefs, max_budget: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Preferred roommate gender</label>
            <div className="flex gap-2 flex-wrap">
              {GENDER_PREF.map((opt) => (
                <button key={opt.value} onClick={() => setPrefs({ ...prefs, gender_preference: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${prefs.gender_preference === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Sleep schedule</label>
            <div className="flex gap-2 flex-wrap">
              {SLEEP_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setPrefs({ ...prefs, sleep_schedule: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${prefs.sleep_schedule === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Cleanliness level</label>
            <div className="flex gap-2 flex-wrap">
              {CLEANLINESS.map((opt) => (
                <button key={opt.value} onClick={() => setPrefs({ ...prefs, cleanliness: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${prefs.cleanliness === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Noise level preference</label>
            <div className="flex gap-2 flex-wrap">
              {NOISE.map((opt) => (
                <button key={opt.value} onClick={() => setPrefs({ ...prefs, noise_level: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${prefs.noise_level === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[['smoking_ok', '🚬 Smoking OK'], ['pets_ok', '🐾 Pets OK'], ['guests_ok', '👥 Guests OK']].map(([key, label]) => (
              <button key={key} onClick={() => setPrefs({ ...prefs, [key]: !prefs[key as keyof Preference] })}
                className={`px-3 py-2.5 rounded-lg text-sm border font-medium transition-all ${prefs[key as keyof Preference] ? 'bg-green-50 text-green-700 border-green-200' : 'border-gray-200 text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Max search distance: {prefs.max_distance_km} km</label>
            <input type="range" min={1} max={50} value={prefs.max_distance_km}
              onChange={(e) => setPrefs({ ...prefs, max_distance_km: Number(e.target.value) })} className="w-full" />
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
