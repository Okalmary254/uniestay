import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const home = user
    ? user.role === 'landlord' ? '/landlord' : '/student'
    : '/browse'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-10">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-xl font-semibold text-gray-900">UniStay</span>
        </div>
        <p className="text-7xl font-semibold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-medium text-gray-800 mb-2">Page not found</h1>
        <p className="text-sm text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to={home} className="btn-primary">Go to dashboard</Link>
          <Link to="/browse" className="btn-secondary">Browse listings</Link>
        </div>
      </div>
    </div>
  )
}
