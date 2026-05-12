import { useEffect, useMemo, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { login } from '../../api/client.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../../context/AdminSessionContext.jsx'
import '../../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.next || '/dashboard'
  const errorMsg = location.state?.error // Lấy thông báo lỗi từ redirect (VD: customer bị từ chối)
  const { refresh } = useAdminSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  // State lưu lỗi validation cho từng field
  const [errors, setErrors] = useState({ email: '', password: '', general: '' })
  // State điều khiển hiện/ẩn mật khẩu để user kiểm tra khi nhập sai
  const [showPassword, setShowPassword] = useState(false)

  // Hiển thị thông báo lỗi khi có error từ redirect (VD: customer đăng nhập admin)
  useEffect(() => {
    if (errorMsg) {
      // Hiển thị lỗi inline dưới form
      setErrors(prev => ({ ...prev, general: errorMsg }))
      // Hiển thị toast thông báo
      toast.error(errorMsg, {
        autoClose: 4000,
        position: 'top-center'
      })
      // Xóa error khỏi URL state để không hiển thị lại khi refresh
      navigate('/login', { replace: true, state: {} })
    }
  }, [errorMsg, navigate, setErrors])

  // Regex kiểm tra email format cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Hàm validate form trước khi submit
  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' }
    let isValid = true

    if (!email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Hàm clear lỗi khi user nhập lại
  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: '', general: '' }))
  }

  const canSubmit = useMemo(() => {
    if (busy) return false
    if (!email.trim()) return false
    if (!password) return false
    return true
  }, [busy, email, password])

  async function submit(e) {
    e?.preventDefault?.()
    if (!canSubmit) return

    // Validate form trước khi gọi API
    if (!validateForm()) return

    setBusy(true)
    // Clear lỗi chung cũ trước khi submit
    setErrors(prev => ({ ...prev, general: '' }))
    const toastId = toast.loading('Signing in…')

    try {
      const res = await login({ email: email.trim(), password })
      if (!res?.success) throw new Error(res?.message || 'Login failed')
      if (!res?.token) throw new Error('Missing token')

      localStorage.setItem('token', res.token)
      toast.update(toastId, { render: 'Signed in', type: 'success', isLoading: false, autoClose: 1400 })
      await refresh()
      navigate(next, { replace: true })
    } catch (err) {
      const errorMessage = err?.message || 'Login failed'

      // Map lỗi API vào field tương ứng nếu có thể
      const lowerMsg = errorMessage.toLowerCase()
      if (lowerMsg.includes('email') || lowerMsg.includes('user')) {
        setErrors(prev => ({ ...prev, email: errorMessage, general: '' }))
      } else if (lowerMsg.includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage, general: '' }))
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }))
      }

      toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <style>{`
        input[type="password"]::-webkit-textfield-decoration-container{display:none!important}
        input::-webkit-contacts-auto-fill-button,input::-webkit-credentials-auto-fill-button{visibility:hidden;display:none!important;pointer-events:none}
        input[type="password"]::-ms-reveal,input[type="password"]::-ms-clear{display:none!important}
      `}</style>

      <div className="loginShell fadeIn">
        <div className="loginBrand">
          <div className="loginBrand__bgPattern" />
          <div className="loginBrand__orb1" />
          <div className="loginBrand__orb2" />
          <div className="loginBrand__orb3" />
          <div className="loginBrand__content">
            <div className="loginBrand__logo">F</div>
            <h1 className="loginBrand__title">FoodOrder Admin</h1>
            <p className="loginBrand__subtitle">Manage your restaurant empire with powerful tools and real-time insights.</p>
            <div className="loginBrand__features">
              <div className="loginBrand__feature">
                <div className="loginBrand__featureIcon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                </div>
                <span>Full menu & inventory control</span>
              </div>
              <div className="loginBrand__feature">
                <div className="loginBrand__featureIcon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </div>
                <span>Real-time order tracking</span>
              </div>
              <div className="loginBrand__feature">
                <div className="loginBrand__featureIcon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                </div>
                <span>Analytics & revenue dashboard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="loginForm">
          <div className="loginForm__inner">
            <div className="loginForm__greeting">Welcome back</div>
            <h2 className="loginForm__title">Sign in to Admin</h2>
            <p className="loginForm__desc">Enter your credentials to access the dashboard</p>

            {errors.general && (
              <div className="loginError">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={submit}>
              <div className={`loginField${errors.email ? ' loginField--error' : ''}`}>
                <div className="loginField__inputWrap">
                  <svg className="loginField__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 5L2 7" /></svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                    placeholder="Email address"
                    autoFocus
                  />
                </div>
                {errors.email && <div className="loginField__error"><span>{errors.email}</span></div>}
              </div>

              <div className={`loginField${errors.password ? ' loginField--error' : ''}`}>
                <div className="loginField__inputWrap">   {/* 👈 thêm wrapper */}

                  <svg className="loginField__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                    placeholder="Password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    className="loginField__toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <div className="loginField__error"><span>{errors.password}</span></div>}
              </div>

              <button className="loginBtn" type="submit" disabled={!canSubmit}>
                {busy ? <><span className="loginSpinner" />Signing in…</> : 'Sign in'}
              </button>
            </form>

            <div className="loginFooter">
              FoodOrder Admin &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={4000}
        pauseOnHover
        newestOnTop
        closeOnClick
      />
    </>
  )
}

