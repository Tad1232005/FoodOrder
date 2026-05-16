import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout.jsx'
import FoodList from './pages/FoodList/FoodList.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import FoodAdd from './pages/FoodAdd/FoodAdd.jsx'
import Orders from './pages/Orders/Orders.jsx'
import Users from './pages/Users/Users.jsx'
import Discounts from './pages/Discounts/Discounts.jsx'
import Login from './pages/Login/Login.jsx'
import RequireAdmin from './components/Auth/RequireAdmin.jsx'
import { useAdminSession } from './context/AdminSessionContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { url } from './config/config.js'

function RequireNotStaff({ children }) {
  const { user } = useAdminSession()
  if (user?.role === 'staff') return <Navigate to="/foods" replace />
  return children
}

const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/foods" element={<FoodList />} />
          <Route
            path="/foods/new"
            element={
              <RequireNotStaff>
                <FoodAdd />
              </RequireNotStaff>
            }
          />
          <Route path="/orders" element={<Orders url={url} />} />
          <Route
            path="/users"
            element={
              <RequireNotStaff>
                <Users />
              </RequireNotStaff>
            }
          />
          <Route path="/discounts" element={<Discounts />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App