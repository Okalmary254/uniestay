import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const access = localStorage.getItem('access')
    if (!access) { setLoading(false); return }
    authAPI.profile()
      .then(({ data }) => setUser(data))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('access',  data.access)
    localStorage.setItem('refresh', data.refresh)
    localStorage.setItem('user',    JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData)
    localStorage.setItem('access',  data.access)
    localStorage.setItem('refresh', data.refresh)
    localStorage.setItem('user',    JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    const merged = { ...user, ...updated }
    localStorage.setItem('user', JSON.stringify(merged))
    setUser(merged)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
