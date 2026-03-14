import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertiesAPI, bookingsAPI, maintenanceAPI } from '../../api'
import { StatCard, Spinner, Badge } from '../../components/UI'

export default function LandlordOverview() {
  const [properties, setProperties] = useState([])
  const [bookings,   setBookings]   = useState([])
  const [payments,   setPayments]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([propertiesAPI.list(), bookingsAPI.list(), bookingsAPI.payments.list()])
      .then(([p, b, pay]) => {
        setProperties(p.data.results ?? p.data)
        setBookings(b.data.results ?? b.data)
        setPayments(pay.data.results ?? pay.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleBooking = async (id, status, idx) => {
    await bookingsAPI.update(id, { status })
    setBookings(prev => prev.map((b, i) => i === idx ? { ...b, status } : b))
  }

  if (loading) return <Spinner />

  const pending  = bookings.filter(b => b.status === 'pending')
  const active   = properties.filter(p => p.status === 'active').length
  const income   = payments
    .filter(p => p.status === 'confirmed')
    .reduce((s, p) => s + Number(p.amount), 0)

  const emoji = { single_room: '🏠', bedsitter: '🏢', '1br': '🏗️', '2br': '🏙️', shared: '🏘️' }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total listings"    value={properties.length} />
        <StatCard label="Active listings"   value={active}            color="green" />
        <StatCard label="Pending bookings"  value={pending.length}    color={pending.length > 0 ? 'amber' : 'default'} />
        <StatCard label="Total income"      value={`KSh ${income.toLocaleString()}`} color="green" />
      </div>

      {/* Pending bookings */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Pending booking requests ({pending.length})</h2>
        <Link to="/landlord/bookings" className="text-xs text-teal-600 hover:underline">View all</Link>
      </div>
      {pending.length === 0 ? (
        <div className="card text-center py-5 mb-5">
          <p className="text-sm text-gray-400">No pending requests right now.</p>
        </div>
      ) : (
        pending.slice(0, 3).map((b, i) => (
          <div key={b.id} className="card flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-800 flex-shrink-0">
              {b.student?.first_name?.[0]}{b.student?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {b.student?.first_name} {b.student?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {b.property_detail?.title} · {b.student?.university} · {b.move_in_date} · {b.duration_months}mo
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleBooking(b.id, 'accepted', bookings.indexOf(b))}
                className="btn-acc text-xs py-1.5 px-3">Accept</button>
              <button onClick={() => handleBooking(b.id, 'declined', bookings.indexOf(b))}
                className="btn-danger text-xs py-1.5 px-3">Decline</button>
            </div>
          </div>
        ))
      )}

      {/* My listings */}
      <div className="flex items-center justify-between mb-3 mt-5">
        <h2 className="text-sm font-medium text-gray-700">My listings</h2>
        <Link to="/landlord/add" className="btn-primary text-xs py-1.5">+ Add property</Link>
      </div>
      {properties.map(p => (
        <div key={p.id} className="card flex items-center gap-3 mb-3">
          <div className="w-14 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
            {emoji[p.property_type] ?? '🏠'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
            <p className="text-xs text-gray-400 truncate">{p.city}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {p.amenities?.slice(0, 3).map(a => (
                <span key={a.id} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{a.name}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-teal-600">KSh {Number(p.rent).toLocaleString()}/mo</p>
            <Badge status={p.status} />
          </div>
        </div>
      ))}
      {properties.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-sm text-gray-400 mb-3">No listings yet.</p>
          <Link to="/landlord/add" className="btn-primary text-sm">Add your first property</Link>
        </div>
      )}
    </div>
  )
}
