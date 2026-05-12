import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from '../api/client.js'

const AdminSessionContext = createContext(null)

export function AdminSessionProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const refresh = useCallback(async () => {
    let token = ''
    try {
      token = localStorage.getItem('token') || ''
    } catch {
      token = ''
    }
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await getMe()
      if (!res?.success) throw new Error(res?.message || 'Failed to load session')
      const u = res?.data || null
      // Treat missing role as customer (locked out)
      if (u && !u.role) u.role = 'customer'
      setUser(u)
    } catch {
      try {
        localStorage.removeItem('token')
      } catch {
        // ignore
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token')
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  const value = useMemo(() => ({ loading, user, refresh, logout }), [loading, user, refresh, logout])
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext)
  if (!ctx) throw new Error('useAdminSession must be used within AdminSessionProvider')
  return ctx
}

