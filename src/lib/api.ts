import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) => api.post('/auth/register/', data),
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  changePassword: (data: object) => api.post('/auth/change-password/', data),
}

// ── Profiles ──────────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: () => api.get('/profiles/me/'),
  updateMe: (data: object) => api.patch('/profiles/me/', data),
  getById: (id: number) => api.get(`/profiles/${id}/`),
  getPreferences: () => api.get('/profiles/preferences/'),
  updatePreferences: (data: object) => api.put('/profiles/preferences/', data),
  updateLocation: (data: object) => api.put('/profiles/location/', data),
}

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingApi = {
  list: (params?: object) => api.get('/listings/', { params }),
  create: (data: object) => api.post('/listings/', data),
  getById: (id: number) => api.get(`/listings/${id}/`),
  update: (id: number, data: object) => api.patch(`/listings/${id}/`, data),
  delete: (id: number) => api.delete(`/listings/${id}/`),
  mine: () => api.get('/listings/mine/'),
  nearby: (lat: number, lng: number, radius?: number) =>
    api.get('/listings/nearby/', { params: { lat, lng, radius: radius || 10 } }),
  uploadPhoto: (id: number, formData: FormData) =>
    api.post(`/listings/${id}/photos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// ── Matching ──────────────────────────────────────────────────────────────────
export const matchApi = {
  suggestions: () => api.get('/matches/suggestions/'),
  request: (targetUserId: number, listingId?: number) =>
    api.post('/matches/request/', { target_user_id: targetUserId, listing_id: listingId }),
  mine: (status?: string) => api.get('/matches/my/', { params: { status } }),
  accept: (id: number) => api.put(`/matches/${id}/accept/`),
  decline: (id: number) => api.put(`/matches/${id}/decline/`),
}

// ── Messaging ─────────────────────────────────────────────────────────────────
export const messagingApi = {
  conversations: () => api.get('/conversations/'),
  createConversation: (participantId: number) =>
    api.post('/conversations/', { participant_id: participantId }),
  messages: (convId: number) => api.get(`/conversations/${convId}/messages/`),
  send: (convId: number, content: string) =>
    api.post(`/conversations/${convId}/messages/send/`, { content }),
  markRead: (convId: number) => api.put(`/conversations/${convId}/messages/read/`),
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewApi = {
  create: (data: object) => api.post('/reviews/', data),
  forUser: (userId: number) => api.get(`/reviews/user/${userId}/`),
  report: (id: number, reason: string) => api.post(`/reviews/${id}/report/`, { reason }),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  list: (params?: object) => api.get('/notifications/', { params }),
  markRead: (id: number) => api.put(`/notifications/${id}/read/`),
  markAllRead: () => api.put('/notifications/read-all/'),
  unreadCount: () => api.get('/notifications/unread-count/'),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats/'),
  users: (params?: object) => api.get('/admin/users/', { params }),
  banUser: (id: number) => api.put(`/admin/users/${id}/ban/`),
  unbanUser: (id: number) => api.put(`/admin/users/${id}/unban/`),
  flaggedListings: () => api.get('/admin/listings/flagged/'),
  approveListing: (id: number) => api.put(`/admin/listings/${id}/approve/`),
  rejectListing: (id: number) => api.put(`/admin/listings/${id}/reject/`),
  broadcast: (message: string, channel: string) =>
    api.post('/admin/broadcast/', { message, channel }),
}
