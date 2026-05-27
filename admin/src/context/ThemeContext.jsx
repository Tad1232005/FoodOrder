import { createContext, useContext, useEffect, useState } from 'react'
// 1. Import ConfigProvider và theme từ antd
import { ConfigProvider, theme as antdTheme } from 'antd'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    try {
      const stored = localStorage.getItem('admin.theme')
      if (stored === 'dark' || stored === 'light') return stored
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    try {
      localStorage.setItem('admin.theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-bs-theme', theme)
    document.body.className = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* 2. Bọc ConfigProvider ở đây để Antd tự động chuyển màu dropdown */}
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            // Bạn có thể tùy chỉnh thêm màu chủ đạo tại đây nếu muốn
            // primaryColor: '#3b82f6', 
          }
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}