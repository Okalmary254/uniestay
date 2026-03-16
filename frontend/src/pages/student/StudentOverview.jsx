import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI, maintenanceAPI } from '../../api'
import { StatCard, Spinner, Badge, InfoRow } from '../../components/UI'

export default function StudentOverview() {
  const [bookings,  setBookings]  = useState([])
  const [payments,  setPayments]  = useState([])
  const [maints,    setMaints]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([bookingsAPI.list(), bookingsAPI.payments.list(), maintenanceAPI.list()])
      .then(([b, p, m]) => {
        setBookings(b.data.results ?? b.data)
        setPayments(p.data.results ?? p.data)
        setMaints(m.data.results ?? m.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active   = bookings.find(b => b.status === 'accepted')
  const prop     = active?.property_detail
  const landlord = active?.student  // reuse for display — actual landlord is in property
  const openM    = maints.filter(m => m.status !== 'resolved')
  const confirmedPayments = payments.filter(p => p.status === 'confirmed' && p.label !== 'Security deposit')
  const totalPaid = confirmedPayments.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-5">
        <StatCard label="Lease status"    value={active ? 'Active' : 'No lease'} color={active ? 'green' : 'default'} />
        <StatCard label="Monthly rent"    value={prop ? `KSh ${Number(prop.rent).toLocaleString()}` : '—'} />
        <StatCard label="Total paid"      value={`KSh ${totalPaid.toLocaleString()}`} color="green" />
        <StatCard label="Open requests"   value={openM.length} color={openM.length > 0 ? 'amber' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Current accommodation */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Current accommodation</h2>
          {prop ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🏢</div>
                <div>
                  <p className="font-medium text-sm">{prop.title}</p>
                  <p className="text-xs text-gray-400">{prop.city}</p>
                </div>
              </div>
              <InfoRow label="Lease ends"  value={active.lease_end_date ?? '—'} />
              <InfoRow label="Unit"        value={active.unit_number || '—'} />
              <InfoRow label="Move-in"     value={active.move_in_date} />
              <div className="mt-3">
                <Link to="/student/lease" className="text-xs text-teal-600 hover:underline">View full lease →</Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No active lease yet.</p>
              <Link to="/browse" className="btn-primary text-sm">Browse listings</Link>
            </div>
          )}
        </div>

        {/* Lease progress */}
        {active && prop && (
          <div className="card">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Lease progress</h2>
            <p className="text-xs text-gray-400 mb-2">
              {active.move_in_date} → {active.lease_end_date ?? '—'}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '25%' }} />
            </div>
            <InfoRow label="Monthly rent"    value={`KSh ${Number(prop.rent).toLocaleString()}`} />
            <InfoRow label="Deposit held"    value={`KSh ${Number(prop.deposit).toLocaleString()}`} />
            <InfoRow label="Total paid"      value={`KSh ${totalPaid.toLocaleString()}`} />
          </div>
        )}
      </div>

      {/* Recent notifications */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Recent activity</h2>
        {openM.length === 0 && confirmedPayments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No recent activity.</p>
        ) : (
          <div className="space-y-0">
            {openM.slice(0, 2).map(m => (
              <div key={m.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.title}</p>
                  <p className="text-xs text-gray-400">{m.category} · <Badge status={m.status} /></p>
                </div>
              </div>
            ))}
            {confirmedPayments.slice(0, 2).map(p => (
              <div key={p.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
                <span className="mt-1 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Payment confirmed — {p.label}</p>
                  <p className="text-xs text-gray-400">KSh {Number(p.amount).toLocaleString()} · {p.payment_date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
