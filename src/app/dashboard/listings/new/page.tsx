'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, ArrowRight, Upload, X, ImagePlus, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { listingApi } from '@/lib/api'

const schema = z.object({
  title:                z.string().min(5, 'Title must be at least 5 characters'),
  description:          z.string().min(20, 'Description must be at least 20 characters'),
  rent:                 z.coerce.number().min(500, 'Rent must be at least KES 500'),
  rooms_available:      z.coerce.number().min(1, 'At least 1 room required'),
  furnished:            z.enum(['furnished', 'semi', 'unfurnished']),
  city:                 z.string().min(2, 'City is required'),
  area:                 z.string().min(2, 'Area is required'),
  address:              z.string().optional(),
  preferred_gender:     z.enum(['any', 'male', 'female']),
  has_wifi:             z.boolean().optional(),
  has_parking:          z.boolean().optional(),
  has_gym:              z.boolean().optional(),
  has_pool:             z.boolean().optional(),
  has_security:         z.boolean().optional(),
  water_included:       z.boolean().optional(),
  electricity_included: z.boolean().optional(),
  smoking_allowed:      z.boolean().optional(),
  pets_allowed:         z.boolean().optional(),
  guests_allowed:       z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

const amenities = [
  { name: 'has_wifi',             label: '📶 WiFi included' },
  { name: 'has_parking',          label: '🚗 Parking' },
  { name: 'has_gym',              label: '🏋️ Gym access' },
  { name: 'has_pool',             label: '🏊 Swimming pool' },
  { name: 'has_security',         label: '🔒 Security / Guard' },
  { name: 'water_included',       label: '💧 Water included' },
  { name: 'electricity_included', label: '⚡ Electricity included' },
  { name: 'smoking_allowed',      label: '🚬 Smoking allowed' },
  { name: 'pets_allowed',         label: '🐾 Pets allowed' },
  { name: 'guests_allowed',       label: '👥 Guests allowed' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      furnished: 'furnished',
      preferred_gender: 'any',
      rooms_available: 1,
      has_wifi: false, has_parking: false, has_gym: false,
      has_pool: false, has_security: false, water_included: false,
      electricity_included: false, smoking_allowed: false,
      pets_allowed: false, guests_allowed: true,
    },
  })

  const nextStep = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      1: ['title', 'description', 'rent', 'rooms_available', 'furnished'],
      2: ['city', 'area'],
    }
    const valid = await trigger(fields[step as 1 | 2])
    if (valid) setStep((s) => (s + 1) as 1 | 2 | 3 | 4)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await listingApi.create(data)
      setCreatedId(res.data.id)
      toast.success('Listing created! Now add some photos.')
      setStep(4)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 8) {
      toast.error('Maximum 8 photos allowed')
      return
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setPhotos((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const uploadPhotos = async () => {
    if (!createdId) return
    if (photos.length === 0) {
      router.push(`/dashboard/listings/${createdId}`)
      return
    }
    setUploading(true)
    try {
      await Promise.all(
        photos.map((file) => {
          const form = new FormData()
          form.append('image', file)
          return listingApi.uploadPhoto(createdId, form)
        })
      )
      toast.success('Photos uploaded!')
      router.push(`/dashboard/listings/${createdId}`)
    } catch {
      toast.error('Some photos failed to upload')
      router.push(`/dashboard/listings/${createdId}`)
    } finally {
      setUploading(false)
    }
  }

  const steps = ['Basic Info', 'Location', 'Amenities', 'Photos']

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/listings" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Post a Room</h1>
          <p className="page-subtitle">Fill in the details to list your room</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${active || done ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done    ? 'bg-emerald-500 text-white' :
                  active  ? 'bg-primary-600 text-white' :
                            'bg-gray-200 text-gray-500'
                }`}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 mx-1 ${step > n ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card space-y-5">

          {/* Step 1 — Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="label">Listing title</label>
                <input {...register('title')} placeholder="e.g. Spacious bedsitter in Westlands" className="input" />
                {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={4} placeholder="Describe the room, building, neighbourhood..." className="input resize-none" />
                {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly rent (KES)</label>
                  <input {...register('rent')} type="number" placeholder="15,000" className="input" />
                  {errors.rent && <p className="text-red-500 text-xs mt-1.5">{errors.rent.message}</p>}
                </div>
                <div>
                  <label className="label">Rooms available</label>
                  <input {...register('rooms_available')} type="number" min={1} placeholder="1" className="input" />
                  {errors.rooms_available && <p className="text-red-500 text-xs mt-1.5">{errors.rooms_available.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Furnished status</label>
                  <select {...register('furnished')} className="input">
                    <option value="furnished">Fully furnished</option>
                    <option value="semi">Semi-furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div>
                  <label className="label">Preferred tenant gender</label>
                  <select {...register('preferred_gender')} className="input">
                    <option value="any">Any gender</option>
                    <option value="male">Male only</option>
                    <option value="female">Female only</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input {...register('city')} placeholder="Nairobi" className="input" />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">Area / Neighbourhood</label>
                  <input {...register('area')} placeholder="Westlands" className="input" />
                  {errors.area && <p className="text-red-500 text-xs mt-1.5">{errors.area.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Street address <span className="text-gray-400 font-normal">(optional)</span></label>
                <input {...register('address')} placeholder="e.g. Rhapta Road, next to Sarit Centre" className="input" />
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-700 font-medium mb-1">📍 Location tip</p>
                <p className="text-xs text-amber-600">Be specific — tenants search by area. Good location info means more views.</p>
              </div>
            </>
          )}

          {/* Step 3 — Amenities */}
          {step === 3 && (
            <div>
              <label className="label mb-3">What does the room include?</label>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(({ name, label }) => {
                  const checked = watch(name as keyof FormData) as boolean
                  return (
                    <label key={name} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      checked ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="checkbox" {...register(name as keyof FormData)} className="sr-only" />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border-2 shrink-0 transition-all ${
                        checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                      }`}>
                        {checked && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className={`text-sm font-medium ${checked ? 'text-primary-700' : 'text-gray-700'}`}>{label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation for steps 1-3 */}
          {step < 4 && (
            <div className={`flex gap-3 pt-4 border-t border-gray-100 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)} className="btn-secondary flex items-center gap-2">
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-2">
                  Next <ArrowRight size={15} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={15} />}
                  Continue to Photos
                </button>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Step 4 — Photo Upload */}
      {step === 4 && (
        <div className="card space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Add Photos</h3>
            <p className="text-sm text-gray-500 mt-1">Listings with photos get 3× more views. Add up to 8 photos.</p>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
          >
            <ImagePlus size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each · Max 8 photos</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Photo previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 badge badge-green text-xs">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length < 8 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
                >
                  <Upload size={20} className="text-gray-300" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-between">
            <button
              type="button"
              onClick={() => createdId && router.push(`/dashboard/listings/${createdId}`)}
              className="btn-secondary text-sm"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={uploadPhotos}
              disabled={uploading}
              className="btn-primary flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              {photos.length > 0 ? `Upload ${photos.length} photo${photos.length > 1 ? 's' : ''} & Publish` : 'Publish listing'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
