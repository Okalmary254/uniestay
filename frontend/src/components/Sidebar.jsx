import { NavLink } from 'react-router-dom'

const ICONS = {
  'Overview':       '⊞',
  'Add property':   '+',
  'My listings':    '≡',
  'Bookings':       '📋',
  'Maintenance':    '🔧',
  'My profile':     '◎',
  'My lease':       '📄',
  'Payments':       '💳',
  'Documents':      '🗂',
}

export default function Sidebar({ items, role }) {
  const activeClass = role === 'landlord' ? 'active-landlord' : 'active-student'
  const activeMobile = role === 'landlord' ? 'text-teal-600' : 'text-blue-600'
  const inactiveMobile = 'text-gray-400'

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:block w-48 bg-white border-r border-gray-100
                        flex-shrink-0 py-3 min-h-full">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 3}
            className={({ isActive }) => `nav-item ${isActive ? activeClass : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-white border-t border-gray-200
                      grid safe-area-pb"
           style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, 1fr)` }}>
        {items.slice(0, 5).map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 3}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5
               py-2 px-1 text-center transition-colors
               ${isActive ? activeMobile : inactiveMobile}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-base leading-none">{ICONS[label] ?? '•'}</span>
                <span className={`text-[10px] leading-tight font-medium truncate w-full text-center
                                  ${isActive ? '' : 'opacity-70'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}