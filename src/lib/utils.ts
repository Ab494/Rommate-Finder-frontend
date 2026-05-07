import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCurrency(amount: number) {
  return `KES ${amount.toLocaleString()}`
}

export function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50'
  if (score >= 40) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

export function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent match'
  if (score >= 60) return 'Good match'
  if (score >= 40) return 'Fair match'
  return 'Low match'
}

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getAvatarUrl(profile: { photo_url?: string | null; full_name: string }) {
  if (profile.photo_url) return profile.photo_url
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name)}`
}
