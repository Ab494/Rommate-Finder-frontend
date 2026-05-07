'use client'
import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, MapPin, Wifi, Car, Plus } from 'lucide-react'
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

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = { search, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await listingApi.list(params)
      setListings(res.data.results)
    } catch { toast.error('Failed to load listings') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchListings() }, [search, filters])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Room</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} listings available</p>
        </div>
        {(user?.role === 'lister' || user?.role === 'both') && (
          <Link href="/dashboard/listings/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Post a Room
          </Link>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="card mb-6 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, area, city..."
              className="input pl-9"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={cn('btn-secondary flex items-center gap-2', showFilters && 'border-primary-300 text-primary-600')}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="label text-xs">City</label>
              <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder="Nairobi" className="input text-sm" />
            </div>
            <div>
              <label className="label text-xs">Min rent (KES)</label>
              <input value={filters.min_rent} onChange={(e) => setFilters({ ...filters, min_rent: e.target.value })} placeholder="5,000" className="input text-sm" type="number" />
            </div>
            <div>
              <label className="label text-xs">Max rent (KES)</label>
              <input value={filters.max_rent} onChange={(e) => setFilters({ ...filters, max_rent: e.target.value })} placeholder="50,000" className="input text-sm" type="number" />
            </div>
            <div>
              <label className="label text-xs">Furnished</label>
              <select value={filters.furnished} onChange={(e) => setFilters({ ...filters, furnished: e.target.value })} className="input text-sm">
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi">Semi</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Listing grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-64" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Home size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No listings found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
              <div className="card p-0 overflow-hidden hover:shadow-card-hover transition-shadow cursor-pointer group">
                {/* Photo */}
                <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                  {listing.photos[0] ? (
                    <img src={listing.photos[0].image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">🏠</div>
                  )}
                  <span className={cn('absolute top-3 right-3 badge', listing.furnished === 'furnished' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {listing.furnished}
                  </span>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={13} />
                    <span>{listing.area}, {listing.city}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary-700 font-bold">{formatCurrency(listing.rent)}<span className="text-gray-400 font-normal text-xs">/mo</span></span>
                    <div className="flex gap-2">
                      {listing.has_wifi && <Wifi size={14} className="text-gray-400" />}
                      {listing.has_parking && <Car size={14} className="text-gray-400" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                      {listing.owner_name[0]}
                    </div>
                    <span className="text-xs text-gray-500">{listing.owner_name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo(listing.created_at)}</span>
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

function Home(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> }
