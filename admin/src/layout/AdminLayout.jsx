import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAdminSession } from '../context/AdminSessionContext.jsx'
import ConfirmDialog from '../components/Modal/ConfirmDialog.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAdminSession()
  const { theme, toggleTheme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin.sidebarCollapsed') === '1'
    } catch {
      return false
    }
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const isStaff = user?.role === 'staff'

  function handleLogout() {
    setShowLogoutConfirm(true)
  }

  function confirmLogout() {
    logout()
    setMobileMenuOpen(false)
    setShowLogoutConfirm(false)
    navigate('/login')
  }

  useEffect(() => {
    try {
      localStorage.setItem('admin.sidebarCollapsed', sidebarCollapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  // Kiểm soát navigation cho staff - chỉ chặn /users và hiển thị thông báo
  function guardNav(e, to) {
    if (!isStaff) return
    // Staff bị chặn duy nhất mục User, còn lại vào được hết
    if (to.startsWith('/users')) {
      e.preventDefault()
      // Hiển thị thông báo không có quyền truy cập
      toast.error('You do not have permission to access this section', {
        autoClose: 3000,
        position: 'top-right'
      })
    }
  }

  const headerMeta = useMemo(() => {
    const p = location.pathname || '/'
    if (p.startsWith('/foods/new')) return { kicker: 'Foodlist', title: 'Add new food' }
    if (p.startsWith('/foods')) return { kicker: 'Foodlist', title: 'Food management' }
    if (p.startsWith('/orders')) return { kicker: 'Order', title: 'Order management' }
    if (p.startsWith('/users')) return { kicker: 'User', title: 'User & roles' }
    if (p.startsWith('/discounts')) return { kicker: 'Discount', title: 'Discount rules' }
    return { kicker: 'Dashboard', title: 'Overview' }
  }, [location.pathname])

  return (
    <div className={`adminShell ${sidebarCollapsed ? 'isSidebarCollapsed' : ''} ${mobileMenuOpen ? 'isMobileMenuOpen' : ''}`}>
      {mobileMenuOpen && (
        <div
          className="mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className="adminSidebar" aria-label="Sidebar">
        <div className="adminBrand">
          <div className="adminBrand__logo" aria-hidden="true">
            T
          </div>
          <div className="adminBrand__text">
            <div className="adminBrand__title">Tomato</div>
            <div className="adminBrand__subtitle">Admin</div>
          </div>
        </div>

        <nav className="adminNav" aria-label="Admin navigation">
          <NavLink
            to="/dashboard"
            onClick={(e) => {
              guardNav(e, '/dashboard')
              setMobileMenuOpen(false)
            }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon" aria-hidden="true">
              D
            </span>
            <span className="adminNav__label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/foods"
            onClick={(e) => {
              guardNav(e, '/foods')
              setMobileMenuOpen(false)
            }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon" aria-hidden="true">
              F
            </span>
            <span className="adminNav__label">Foodlist</span>
          </NavLink>

          <NavLink
            to="/orders"
            onClick={(e) => {
              guardNav(e, '/orders')
              setMobileMenuOpen(false)
            }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon" aria-hidden="true">
              O
            </span>
            <span className="adminNav__label">Order</span>
          </NavLink>

          <NavLink
            to="/users"
            onClick={(e) => {
              guardNav(e, '/users')
              setMobileMenuOpen(false)
            }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon" aria-hidden="true">
              U
            </span>
            <span className="adminNav__label">User</span>
          </NavLink>

          <NavLink
            to="/discounts"
            onClick={(e) => {
              guardNav(e, '/discounts')
              setMobileMenuOpen(false)
            }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon" aria-hidden="true">
              %
            </span>
            <span className="adminNav__label">Discount</span>
          </NavLink>

          <NavLink
            to="/reviews"
            onClick={(e) => { guardNav(e, '/reviews'); setMobileMenuOpen(false); }}
            className={({ isActive }) => `adminNav__link ${isActive ? 'isActive' : ''}`}
          >
            <span className="adminNav__icon">R</span>
            <span className="adminNav__label">Reviews</span>
          </NavLink>
        </nav>

        <NavLink
          to="#"
          onClick={(e) => {
            e.preventDefault()
            handleLogout()
            setMobileMenuOpen(false)
          }}
          className="adminNav__link adminNav__link--logout"
        >
          <span className="adminNav__icon" aria-hidden="true">
            L
          </span>
          <span className="adminNav__label">Logout</span>
        </NavLink>

        <div className="adminSidebar__foot">
          <div className="adminSidebar__hint">Backend: http://localhost:4000</div>
        </div>
      </aside>

      <main className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbar__left">
            <button
              className="mobileMenuBtn"
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="adminTopbar__kicker">{headerMeta.kicker}</div>
            <div className="adminTopbar__title">{headerMeta.title}</div>
          </div>
          <div className="adminTopbar__right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="iconBtn desktopOnly"
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className="iconBtn desktopOnly"
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
                title={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            </div>
          </div>
        </header>

        <section className="adminContent">
          <Outlet />
        </section>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={2200}
        pauseOnHover
        newestOnTop
        closeOnClick
        theme={theme}
      />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

