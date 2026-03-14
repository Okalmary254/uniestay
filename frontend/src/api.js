import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post('/api/v1/auth/token/refresh/', { refresh })
        localStorage.setItem('access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ── Named helpers ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login:    (data) => api.post('/auth/login/', data),
  profile:  ()     => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/me/', data),
}

export const propertiesAPI = {
  list:         (params) => api.get('/properties/', { params }),
  get:          (id)     => api.get(`/properties/${id}/`),
  create:       (data)   => api.post('/properties/', data),
  update:       (id, data) => api.patch(`/properties/${id}/`, data),
  remove:       (id)     => api.delete(`/properties/${id}/`),
  uploadImages: (id, formData) =>
    api.post(`/properties/${id}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const bookingsAPI = {
  list:    ()            => api.get('/bookings/'),
  get:     (id)          => api.get(`/bookings/${id}/`),
  create:  (data)        => api.post('/bookings/', data),
  update:  (id, data)    => api.patch(`/bookings/${id}/`, data),
  payments: {
    list:    ()          => api.get('/bookings/payments/'),
    create:  (data)      => api.post('/bookings/payments/', data),
    confirm: (id)        => api.post(`/bookings/payments/${id}/confirm/`),
  },
}

export const maintenanceAPI = {
  list:   ()           => api.get('/maintenance/'),
  create: (data)       => api.post('/maintenance/', data),
  update: (id, data)   => api.patch(`/maintenance/${id}/`, data),
}
