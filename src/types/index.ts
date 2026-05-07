export interface User {
  id: number
  email: string
  phone: string
  role: 'seeker' | 'lister' | 'both'
  is_verified: boolean
  created_at: string
}

export interface Profile {
  id: number
  email: string
  role: string
  full_name: string
  bio: string
  gender: string
  age: number
  occupation: string
  photo: string | null
  photo_url: string | null
  lat: number | null
  lng: number | null
  city: string
  area: string
  average_rating: number
  total_reviews: number
  created_at: string
}

export interface Preference {
  min_budget: number
  max_budget: number
  gender_preference: string
  sleep_schedule: string
  cleanliness: string
  noise_level: string
  smoking_ok: boolean
  pets_ok: boolean
  guests_ok: boolean
  preferred_city: string
  preferred_area: string
  max_distance_km: number
}

export interface ListingPhoto {
  id: number
  image_url: string
  is_cover: boolean
}

export interface Listing {
  id: number
  owner: number
  owner_name: string
  owner_photo: string | null
  owner_rating: number
  title: string
  description: string
  rent: number
  rooms_available: number
  furnished: 'furnished' | 'semi' | 'unfurnished'
  status: 'active' | 'taken' | 'paused'
  city: string
  area: string
  address: string
  lat: number | null
  lng: number | null
  has_wifi: boolean
  has_parking: boolean
  has_gym: boolean
  has_pool: boolean
  has_security: boolean
  water_included: boolean
  electricity_included: boolean
  preferred_gender: string
  smoking_allowed: boolean
  pets_allowed: boolean
  guests_allowed: boolean
  views_count: number
  photos: ListingPhoto[]
  created_at: string
  distance_km?: number
}

export interface Match {
  id: number
  user_a: number
  user_b: number
  user_a_profile: Profile
  user_b_profile: Profile
  listing: number | null
  score: number
  score_breakdown: {
    budget: number
    gender: number
    lifestyle: number
    location: number
    booleans: number
    total: number
  }
  status: 'pending' | 'accepted' | 'declined'
  matched_at: string
}

export interface MatchSuggestion {
  user_id: number
  score: number
  breakdown: {
    budget: number
    gender: number
    lifestyle: number
    location: number
    booleans: number
    total: number
  }
  profile: Profile
}

export interface Message {
  id: number
  conversation: number
  sender: number
  sender_name: string
  sender_photo: string | null
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: number
  other_participant: Profile | null
  last_message: {
    content: string
    created_at: string
    sender_id: number
  } | null
  unread_count: number
  updated_at: string
}

export interface Review {
  id: number
  reviewer: number
  reviewer_name: string
  reviewer_photo: string | null
  reviewee: number
  reviewee_name: string
  rating: number
  comment: string
  is_reported: boolean
  created_at: string
}

export interface Notification {
  id: number
  type: string
  channel: string
  message: string
  is_read: boolean
  sent_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  results: T[]
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}
