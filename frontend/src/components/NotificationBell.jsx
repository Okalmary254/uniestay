import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TYPE_STYLES = {
  booking:     { bg: 'bg-blue-50',  dot: 'bg-blue-400',  icon: '📋' },
  payment:     { bg: 'bg-teal-50',  dot: 'bg-teal-400',  icon: '💳' },
  maintenance: { bg: 'bg-amber-50', dot: 'bg-amber-400', icon: '🔧' },
  reminder:    { bg: 'bg-red-50',   dot: 'bg-red-400',   icon: '⏰' },
}

export default function NotificationBell() {
  const [open, setOpen]             = useState(false)
  const [notifications, setNotifs]  = useState([])
  const ref                         = useRef(null)
  const navigate                    = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // If you have NotificationContext set up, replace this with useNotifications()
  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = (n) => {
    markRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg
                   hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5
                           bg-red-500 text-white text-[10px] font-bold rounded-full
                           flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200
                        rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600
                                 font-medium rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet
              </li>
            ) : (
              notifications.map(n => {
                const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.reminder
                return (
                  <li key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                                transition-colors hover:bg-gray-50
                                ${!n.read ? 'bg-gray-50/70' : 'bg-white'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                     flex-shrink-0 text-sm ${style.bg}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug
                                     ${!n.read ? 'font-medium text-gray-900'
                                               : 'font-normal text-gray-600'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0
                                        mt-1.5 ${style.dot}`} />
                    )}
                  </li>
                )
              })
            )}
          </ul>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button onClick={() => setOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}