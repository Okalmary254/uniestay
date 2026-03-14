import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : '?'

  const handleLogout = () => { logout(); navigate('/browse') }

  return (
    <header className="h-13 bg-white border-b border-gray-100 px-5 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-base font-semibold text-gray-900 no-underline">
        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
        UniStay
        {user && (
          <span className="text-xs font-normal text-gray-400 ml-1">
            {user.role === 'landlord' ? 'Landlord portal' : 'Student portal'}
          </span>
        )}
      </Link>

      <nav className="flex items-center gap-2">
        {!user && (
          <>
            <Link to="/browse" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5">Browse</Link>
            <Link to="/login"  className="btn-secondary text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Sign up</Link>
          </>
        )}
        {user && (
          <>
            <Link
              to={user.role === 'landlord' ? '/landlord' : '/student'}
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5"
            >
              Dashboard
            </Link>
            <Link to="/browse" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5">Browse</Link>
            <div className="flex items-center gap-2 ml-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${user.role === 'landlord' ? 'bg-teal-50 text-teal-800' : 'bg-blue-50 text-blue-800'}`}>
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.first_name || user.username}
              </span>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                Sign out
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
