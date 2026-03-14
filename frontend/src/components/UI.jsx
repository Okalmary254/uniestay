// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status }) {
  const map = {
    active: 'badge-green',   accepted: 'badge-green',  confirmed: 'badge-green',
    resolved: 'badge-green', completed: 'badge-green',
    pending: 'badge-amber',  in_progress: 'badge-amber',
    occupied: 'badge-blue',
    declined: 'badge-red',   failed: 'badge-red',       inactive: 'badge-red',
    held: 'badge-gray',
  }
  const label = status?.replace('_', ' ')
  return <span className={map[status] ?? 'badge-gray'}>{label}</span>
}

// ── Priority badge ─────────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { high: 'badge-red', medium: 'badge-amber', low: 'badge-green' }
  return <span className={map[priority] ?? 'badge-gray'}>{priority}</span>
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color }) {
  const colors = { green: 'text-teal-600', blue: 'text-blue-600', amber: 'text-amber-700', default: 'text-gray-800' }
  return (
    <div className="stat-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-medium ${colors[color] ?? colors.default}`}>{value}</p>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-medium text-gray-700">{title}</h2>
      {action}
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
export function InfoRow({ label, value, accent }) {
  return (
    <div className="trow">
      <span className="trow-label">{label}</span>
      <span className={accent ? 'text-blue-500 text-sm' : 'text-sm text-gray-700'}>{value ?? '—'}</span>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div className="mb-3">
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  )
}

// ── Section divider title ─────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100 mb-3 mt-1">
      {children}
    </p>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ message, action }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-gray-400 mb-3">{message}</p>
      {action}
    </div>
  )
}

// ── Error alert ───────────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
      {message}
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'green', onClose }) {
  if (!message) return null
  const colors = {
    green: 'bg-teal-50 border-teal-200 text-teal-800',
    blue:  'bg-blue-50 border-blue-200 text-blue-800',
    red:   'bg-red-50 border-red-200 text-red-700',
  }
  return (
    <div className={`flex items-center justify-between border rounded-lg px-4 py-2.5 mb-4 text-sm font-medium ${colors[type]}`}>
      {message}
      {onClose && <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 text-lg leading-none">×</button>}
    </div>
  )
}

// ── Property card (for browse grid) ──────────────────────────────────────────
export function PropertyCard({ property, onClick }) {
  const emoji = { single_room: '🏠', bedsitter: '🏢', '1br': '🏗️', '2br': '🏙️', '3br': '🏬', shared: '🏘️' }
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
    >
      <div className="h-28 bg-gray-50 flex items-center justify-center text-4xl">
        {property.primary_image
          ? <img src={property.primary_image} alt={property.title} className="w-full h-full object-cover" />
          : emoji[property.property_type] ?? '🏠'}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm text-gray-900 mb-0.5">{property.title}</p>
        <p className="text-xs text-gray-400 mb-2">{property.neighbourhood ? `${property.neighbourhood}, ` : ''}{property.city}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-teal-600">
            KSh {Number(property.rent).toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span>
          </span>
          <span className="badge-green text-xs">{property.property_type?.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  )
}
