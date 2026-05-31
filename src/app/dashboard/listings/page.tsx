'use client'
import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, MapPin, Wifi, Car, Plus, Home, Star, X } from 'lucide-react'
import Link from 'next/link'
import { listingApi } from '@/lib/api'
import { Listing } from '@/types'
import { formatCurrency, timeAgo, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function ListingsPage() {
  const { user } = useAuthStore()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ city: '', min_rent: '', max_rent: '', furnished: '' })
  const [showFilters, setShowFilters] = useState(false)

  const hasFilters = Object.values(filters).some(Boolean)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = { search, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await listingApi.list(params)
      setListings(res.data.results || [])
    } catch {
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => setFilters({ city: '', min_rent: '', max_rent: '', furnished: '' })

  useEffect(() => { fetchListings() }, [search, filters])

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Find a Room</h1>
          <p className="page-subtitle">
            {loading ? 'Loading listings...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        {(user?.role === 'lister' || user?.role === 'both') && (
          <Link href="/dashboard/listings/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Post a Room
          </Link>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, area, city..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary flex items-center gap-2 shrink-0',
              showFilters && 'border-primary-300 text-primary-600 bg-primary-50'
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label text-xs">City</label>
                <input
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Nairobi"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">Min rent (KES)</label>
                <input
                  value={filters.min_rent}
                  onChange={(e) => setFilters({ ...filters, min_rent: e.target.value })}
                  placeholder="5,000"
                  className="input text-sm"
                  type="number"
                />
              </div>
              <div>
                <label className="label text-xs">Max rent (KES)</label>
                <input
                  value={filters.max_rent}
                  onChange={(e) => setFilters({ ...filters, max_rent: e.target.value })}
                  placeholder="50,000"
                  className="input text-sm"
                  type="number"
                />
              </div>
              <div>
                <label className="label text-xs">Furnished</label>
                <select
                  value={filters.furnished}
                  onChange={(e) => setFilters({ ...filters, furnished: e.target.value })}
                  className="input text-sm"
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl2 border border-gray-100 overflow-hidden">
              <div className="skeleton h-48 rounded-none" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        /* Empty state */
        <div className="empty-state">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <Home size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No listings found</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            {hasFilters ? 'Try adjusting your filters to see more results.' : 'No rooms are listed yet. Check back soon.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Listing grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
              <div className="card-hover overflow-hidden group cursor-pointer">

                {/* Photo */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0].image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home size={40} className="text-primary-300" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <span className={cn(
                      'badge text-xs',
                      listing.furnished === 'furnished' ? 'badge-green' : 'badge-gray'
                    )}>
                      {listing.furnished === 'furnished' ? '✓ Furnished' : listing.furnished}
                    </span>
                    {listing.distance_km && (
                      <span className="badge badge-blue">
                        {listing.distance_km.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate text-base mb-1">{listing.title}</h3>

                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                    <MapPin size={13} className="text-primary-400 shrink-0" />
                    <span className="truncate">{listing.area}, {listing.city}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-primary-700">
                        {formatCurrency(listing.rent)}
                      </span>
                      <span className="text-gray-400 text-xs font-normal">/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.has_wifi && (
                        <span className="text-gray-400 hover:text-primary-500 transition-colors" title="WiFi">
                          <Wifi size={15} />
                        </span>
                      )}
                      {listing.has_parking && (
                        <span className="text-gray-400 hover:text-primary-500 transition-colors" title="Parking">
                          <Car size={15} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Owner row */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                      {listing.owner_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-gray-600 font-medium truncate flex-1">{listing.owner_name}</span>
                    {(listing.owner_rating ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold shrink-0">
                        <Star size={11} fill="currentColor" />
                        {(listing.owner_rating ?? 0).toFixed(1)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(listing.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
