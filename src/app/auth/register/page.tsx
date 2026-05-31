'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['seeker', 'lister', 'both']),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

const roles = [
  { value: 'seeker', label: 'Find a room', desc: 'Looking for a place to stay', icon: '🔍' },
  { value: 'lister', label: 'List a room', desc: 'Have a room to rent out', icon: '🏠' },
  { value: 'both',   label: 'Both',        desc: 'Looking and listing',         icon: '🤝' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'seeker' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { confirm_password, ...payload } = data
      const res = await authApi.register(payload)
      const { user, access, refresh } = res.data
      setAuth(user, access, refresh)
      toast.success('Account created! Welcome to Roommate Finder.')
      router.push('/dashboard/listings')
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="text-gray-500 mt-2">Join thousands finding their perfect roommate</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Role selector */}
        <div>
          <label className="label">I want to</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(({ value, label, desc, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value as any)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                  selectedRole === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className={`text-xs font-semibold ${selectedRole === value ? 'text-primary-700' : 'text-gray-700'}`}>
                  {label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Full name</label>
          <input {...register('full_name')} placeholder="Jane Wanjiku" className="input" />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="label">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className="input" />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input
              {...register('confirm_password')}
              type="password"
              placeholder="Repeat password"
              className="input"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirm_password.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>Create account <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
