import { Navigate, useLocation } from 'react-router-dom'
import { useAdminSession } from '../../context/AdminSessionContext.jsx'

export default function RequireAdmin({ children }) {
  const location = useLocation()
  const { loading, user } = useAdminSession()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />
  }

  // Chỉ cho phép admin và staff truy cập trang admin
  const role = user?.role
  const allowed = role === 'admin' || role === 'staff'
  if (!allowed) {
    // Customer hoặc role khác bị từ chối - xóa token và chuyển về login với thông báo
    try {
      localStorage.removeItem('token')
    } catch {
      // ignore
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{ next: location.pathname, error: 'Account does not exist or access denied' }}
      />
    )
  }

  return children
}

