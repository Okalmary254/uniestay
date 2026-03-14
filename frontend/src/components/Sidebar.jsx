import { NavLink } from 'react-router-dom'

export default function Sidebar({ items, role }) {
  const activeClass = role === 'landlord' ? 'active-landlord' : 'active-student'

  return (
    <aside className="w-48 bg-white border-r border-gray-100 flex-shrink-0 py-3">
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to.endsWith('/') || to.split('/').length <= 3}
          className={({ isActive }) =>
            `nav-item ${isActive ? activeClass : ''}`
          }
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
