import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/admin.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AdminSessionProvider } from './context/AdminSessionContext.jsx'
import "antd/dist/reset.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminSessionProvider>
        <App />
      </AdminSessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
