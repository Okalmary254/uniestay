import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
      || user.username?.[0]?.toUpperCase()
    : '?'

  const handleLogout = () => { logout(); navigate('/browse'); setMenuOpen(false) }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="px-4 h-14 flex items-center justify-between gap-2">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900
                                 no-underline flex-shrink-0 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block flex-shrink-0" />
          <span>UniStay</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
          {!user && (
            <>
              <Link to="/browse"   className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5">Browse</Link>
              <Link to="/login"    className="btn-secondary text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
          {user && (
            <>
              <Link to={user.role === 'landlord' ? '/landlord' : '/student'}
                className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5">
                Dashboard
              </Link>
              <Link to="/browse"
                className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5">
                Browse
              </Link>
              <NotificationBell />
              <div className="flex items-center gap-2 ml-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                 text-xs font-medium flex-shrink-0
                                 ${user.role === 'landlord'
                                   ? 'bg-teal-50 text-teal-800'
                                   : 'bg-blue-50 text-blue-800'}`}>
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.first_name || user.username}
                </span>
                <button onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                  Sign out
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-1 flex-shrink-0">
          {user && <NotificationBell />}
          {/* Avatar pill */}
          {user && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                             text-xs font-medium flex-shrink-0
                             ${user.role === 'landlord'
                               ? 'bg-teal-50 text-teal-800'
                               : 'bg-blue-50 text-blue-800'}`}>
              {initials}
            </div>
          )}
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5
                       rounded-lg hover:bg-gray-100 transition-colors ml-1"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200
                              ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200
                              ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200
                              ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 divide-y divide-gray-50">
          {!user && (
            <>
              <Link to="/browse"   onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm text-gray-700">Browse listings</Link>
              <Link to="/login"    onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm text-gray-700">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm font-medium text-teal-600">Sign up free</Link>
            </>
          )}
          {user && (
            <>
              <div className="px-5 py-3 flex items-center gap-3 bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                 font-medium flex-shrink-0
                                 ${user.role === 'landlord'
                                   ? 'bg-teal-100 text-teal-800'
                                   : 'bg-blue-100 text-blue-800'}`}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              <Link to="/browse" onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm text-gray-700">Browse listings</Link>
              <Link to={user.role === 'landlord' ? '/landlord' : '/student'}
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm text-gray-700">Dashboard</Link>
              <button onClick={handleLogout}
                className="block w-full text-left px-5 py-3 text-sm text-red-500">
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}