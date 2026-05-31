'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { authApi, profileApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, setProfile } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { user, access, refresh } = res.data
      setAuth(user, access, refresh)
      const profileRes = await profileApi.getMe()
      setProfile(profileRes.data)
      toast.success('Welcome back!')
      router.push('/dashboard/listings')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="input"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input pr-11"
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>Sign in <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  )
}
