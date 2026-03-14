import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoadingScreen  from './components/LoadingScreen'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Browse         from './pages/Browse'
import PropertyDetail from './pages/PropertyDetail'
import NotFound       from './pages/NotFound'
import StudentDash    from './pages/student/StudentDash'
import LandlordDash   from './pages/landlord/LandlordDash'

function PrivateRoute({ allowedRole }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'landlord' ? '/landlord' : '/student'} replace />
  }
  return <Outlet />
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/browse" replace />
  return <Navigate to={user.role === 'landlord' ? '/landlord' : '/student'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<RootRedirect />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/browse"      element={<Browse />} />
          <Route path="/browse/:id"  element={<PropertyDetail />} />

          {/* Student only */}
          <Route element={<PrivateRoute allowedRole="student" />}>
            <Route path="/student/*" element={<StudentDash />} />
          </Route>

          {/* Landlord only */}
          <Route element={<PrivateRoute allowedRole="landlord" />}>
            <Route path="/landlord/*" element={<LandlordDash />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
