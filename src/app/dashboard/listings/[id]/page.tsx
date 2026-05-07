'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Wifi, Car, Shield, Droplets, Zap, Users, Heart, MessageCircle, ArrowLeft, Star, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { listingApi, matchApi, messagingApi } from '@/lib/api'
import { Listing } from '@/types'
import { formatCurrency, timeAgo, getInitials, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [requesting, setRequesting] = useState(false)
  const [messaging, setMessaging] = useState(false)

  useEffect(() => {
    listingApi.getById(Number(id))
      .then((res) => setListing(res.data))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleMatchRequest = async () => {
    if (!listing) return
    setRequesting(true)
    try {
      await matchApi.request(listing.owner, listing.id)
      toast.success('Match request sent!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send request')
    } finally { setRequesting(false) }
  }

  const handleMessage = async () => {
    if (!listing) return
    setMessaging(true)
    try {
      const res = await messagingApi.createConversation(listing.owner)
      router.push(`/dashboard/chat/${res.data.id}`)
    } catch { toast.error('Could not start conversation') }
    finally { setMessaging(false) }
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-72 bg-gray-200 rounded-xl" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  )

  if (!listing) return <div className="text-center py-20 text-gray-400">Listing not found</div>

  const isOwner = user?.id === listing.owner
  const amenities = [
    { label: 'WiFi', value: listing.has_wifi, icon: Wifi },
    { label: 'Parking', value: listing.has_parking, icon: Car },
    { label: 'Security', value: listing.has_security, icon: Shield },
    { label: 'Water included', value: listing.water_included, icon: Droplets },
    { label: 'Electricity included', value: listing.electricity_included, icon: Zap },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> Back to listings
      </button>

      {/* Photos */}
      <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
        {listing.photos.length > 0 ? (
          <div>
            <img src={listing.photos[activePhoto]?.image_url} alt={listing.title} className="w-full h-72 object-cover" />
            {listing.photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {listing.photos.map((photo, i) => (
                  <img key={photo.id} src={photo.image_url} alt=""
                    onClick={() => setActivePhoto(i)}
                    className={cn('w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all', i === activePhoto ? 'border-primary-500' : 'border-transparent')}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-6xl bg-gradient-to-br from-primary-50 to-primary-100">🏠</div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <div className="flex items-center gap-1 text-gray-500 mt-1">
                  <MapPin size={14} /> <span>{listing.area}, {listing.city}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-700">{formatCurrency(listing.rent)}</p>
                <p className="text-gray-400 text-sm">per month</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <span className="badge bg-blue-50 text-blue-700">{listing.furnished}</span>
              <span className="badge bg-gray-100 text-gray-600">{listing.rooms_available} room{listing.rooms_available > 1 ? 's' : ''} available</span>
              <span className="badge bg-green-50 text-green-700 flex items-center gap-1"><Eye size={11} /> {listing.views_count} views</span>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map(({ label, value, icon: Icon }) => (
                <div key={label} className={cn('flex items-center gap-2 text-sm', value ? 'text-gray-700' : 'text-gray-300 line-through')}>
                  <Icon size={15} className={value ? 'text-green-500' : 'text-gray-300'} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Roommate Preferences</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="font-medium capitalize">{listing.preferred_gender}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Smoking</span><span className="font-medium">{listing.smoking_allowed ? 'Allowed' : 'Not allowed'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pets</span><span className="font-medium">{listing.pets_allowed ? 'Allowed' : 'Not allowed'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium">{listing.guests_allowed ? 'Allowed' : 'Not allowed'}</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner card */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Posted by</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {listing.owner_photo
                  ? <img src={listing.owner_photo} className="w-12 h-12 rounded-full object-cover" alt="" />
                  : getInitials(listing.owner_name)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.owner_name}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star size={13} fill="currentColor" />
                  <span>{listing.owner_rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Posted {timeAgo(listing.created_at)}</p>

            {!isOwner && (
              <div className="space-y-2">
                <button onClick={handleMatchRequest} disabled={requesting} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Heart size={15} /> {requesting ? 'Sending...' : 'Request Match'}
                </button>
                <button onClick={handleMessage} disabled={messaging} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <MessageCircle size={15} /> {messaging ? 'Opening...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          {listing.lat && listing.lng && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm">
                <div className="text-center">
                  <MapPin size={24} className="mx-auto mb-1 text-primary-500" />
                  <p>{listing.area}</p>
                  <p className="text-xs">{listing.city}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
