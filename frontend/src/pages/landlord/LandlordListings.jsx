import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertiesAPI, bookingsAPI, maintenanceAPI, authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Spinner, Badge, PriorityBadge, StatCard, Toast, ErrorAlert, SectionTitle } from '../../components/UI'

// ── Listings ──────────────────────────────────────────────────────────────────
export function LandlordListings() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    propertiesAPI.list()
      .then(({ data }) => setProperties(data.results ?? data))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    if (!window.confirm('Remove this listing?')) return
    await propertiesAPI.remove(id)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  const emoji = { single_room: '🏠', bedsitter: '🏢', '1br': '🏗️', '2br': '🏙️', shared: '🏘️' }
  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-medium text-gray-900">My listings ({properties.length})</h1>
        <Link to="/landlord/add" className="btn-primary text-xs">+ Add property</Link>
      </div>
      {properties.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400 mb-3">No listings yet.</p>
          <Link to="/landlord/add" className="btn-primary text-sm">Add your first property</Link>
        </div>
      ) : properties.map(p => (
        <div key={p.id} className="card flex items-stretch gap-0 mb-3 overflow-hidden p-0">
          <div className="w-24 bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
            {emoji[p.property_type] ?? '🏠'}
          </div>
          <div className="p-3 flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 mb-0.5">{p.title}</p>
            <p className="text-xs text-gray-400 mb-2">{p.city}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {p.amenities?.slice(0,3).map(a =>
                <span key={a.id} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{a.name}</span>)}
              {p.amenities?.length > 3 &&
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{p.amenities.length - 3}</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-teal-600">KSh {Number(p.rent).toLocaleString()}/mo</span>
              <Badge status={p.status} />
              <div className="ml-auto flex gap-2">
                <button className="btn-secondary text-xs py-1 px-2.5">Edit</button>
                <button onClick={() => remove(p.id)} className="btn-danger text-xs py-1 px-2.5">Remove</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export function LandlordBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    bookingsAPI.list()
      .then(({ data }) => setBookings(data.results ?? data))
      .finally(() => setLoading(false))
  }, [])

  const handle = async (id, status) => {
    await bookingsAPI.update(id, { status })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  if (loading) return <Spinner />

  const pending  = bookings.filter(b => b.status === 'pending')
  const accepted = bookings.filter(b => b.status === 'accepted')
  const others   = bookings.filter(b => !['pending','accepted'].includes(b.status))

  const BookingCard = ({ b }) => (
    <div className="card mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-800 flex-shrink-0">
          {b.student?.first_name?.[0]}{b.student?.last_name?.[0]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{b.student?.first_name} {b.student?.last_name}</p>
          <p className="text-xs text-gray-400">{b.student?.university}</p>
        </div>
        <Badge status={b.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-6 text-xs mb-3">
        <div className="trow"><span className="trow-label">Property</span><span>{b.property_detail?.title}</span></div>
        <div className="trow"><span className="trow-label">Move-in</span><span>{b.move_in_date}</span></div>
        <div className="trow"><span className="trow-label">Duration</span><span>{b.duration_months} months</span></div>
        <div className="trow"><span className="trow-label">Phone</span><span className="text-blue-500">{b.student?.phone}</span></div>
      </div>
      {b.message && <p className="text-xs text-gray-500 italic mb-3">"{b.message}"</p>}
      {b.status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={() => handle(b.id, 'accepted')} className="btn-acc flex-1 text-xs py-2">Accept</button>
          <button onClick={() => handle(b.id, 'declined')} className="btn-danger flex-1 text-xs py-2">Decline</button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h1 className="text-base font-medium text-gray-900 mb-4">Booking requests</h1>
      {pending.length > 0 && <>
        <p className="text-xs text-gray-400 mb-2">Pending ({pending.length})</p>
        {pending.map(b => <BookingCard key={b.id} b={b} />)}
      </>}
      {accepted.length > 0 && <>
        <p className="text-xs text-gray-400 mb-2 mt-4">Accepted ({accepted.length})</p>
        {accepted.map(b => <BookingCard key={b.id} b={b} />)}
      </>}
      {others.length > 0 && <>
        <p className="text-xs text-gray-400 mb-2 mt-4">Other ({others.length})</p>
        {others.map(b => <BookingCard key={b.id} b={b} />)}
      </>}
      {bookings.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400">No booking requests yet.</p>
        </div>
      )}
    </div>
  )
}

// ── Maintenance ───────────────────────────────────────────────────────────────
export function LandlordMaintenance() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [notes, setNotes]       = useState({})

  useEffect(() => {
    maintenanceAPI.list()
      .then(({ data }) => {
        const list = data.results ?? data
        setRequests(list)
        const n = {}
        list.forEach(r => { n[r.id] = r.technician_note ?? '' })
        setNotes(n)
      })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await maintenanceAPI.update(id, { status })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const saveNote = async (id) => {
    await maintenanceAPI.update(id, { technician_note: notes[id] })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, technician_note: notes[id] } : r))
  }

  if (loading) return <Spinner />

  const border = { high: 'border-l-red-400', medium: 'border-l-amber-400', low: 'border-l-teal-400' }
  const open     = requests.filter(r => r.status !== 'resolved')
  const resolved = requests.filter(r => r.status === 'resolved')

  return (
    <div>
      <h1 className="text-base font-medium text-gray-900 mb-4">Maintenance requests</h1>
      {requests.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400">No maintenance requests yet.</p>
        </div>
      )}

      {open.length > 0 && <>
        <p className="text-xs text-gray-400 mb-2">Open ({open.length})</p>
        {open.map(r => (
          <div key={r.id} className={`card border-l-4 mb-3 ${border[r.priority] ?? 'border-l-gray-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">{r.title}</p>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={r.priority} />
                <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-gray-50 text-gray-700">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">
              {r.property_title} · {r.student_name} · {r.category?.replace('_',' ')} · {r.created_at?.slice(0,10)}
            </p>
            <p className="text-xs text-gray-600 mb-2">{r.description}</p>
            <div className="flex gap-2">
              <input value={notes[r.id] ?? ''} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })}
                className="field-input text-xs flex-1 py-1.5" placeholder="Add technician note…" />
              <button onClick={() => saveNote(r.id)} className="btn-secondary text-xs py-1.5 px-3">Save</button>
            </div>
          </div>
        ))}
      </>}

      {resolved.length > 0 && <>
        <p className="text-xs text-gray-400 mb-2 mt-4">Resolved ({resolved.length})</p>
        {resolved.map(r => (
          <div key={r.id} className="card border-l-4 border-l-gray-200 mb-3 opacity-60">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{r.title}</p>
              <Badge status="resolved" />
            </div>
            <p className="text-xs text-gray-400">{r.category?.replace('_',' ')} · {r.student_name} · {r.technician_note}</p>
          </div>
        ))}
      </>}
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────────────────
export function LandlordProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    first_name:       user?.first_name       ?? '',
    last_name:        user?.last_name        ?? '',
    phone:            user?.phone            ?? '',
    email:            user?.email            ?? '',
    whatsapp:         user?.whatsapp         ?? '',
    national_id:      user?.national_id      ?? '',
    bank_name:        user?.bank_name        ?? '',
    bank_account:     user?.bank_account     ?? '',
    mpesa_number:     user?.mpesa_number     ?? '',
    preferred_contact: user?.preferred_contact ?? 'whatsapp',
  })
  const [toast,  setToast]  = useState('')
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(form)
      updateUser(data)
      setToast('Profile saved.')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  const initials = `${form.first_name?.[0] ?? ''}${form.last_name?.[0] ?? ''}`.toUpperCase()

  return (
    <div>
      {toast && <Toast message={toast} type="green" onClose={() => setToast('')} />}
      <div className="card">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-xl font-medium text-teal-800">
            {initials}
          </div>
          <div>
            <p className="text-lg font-medium">{form.first_name} {form.last_name}</p>
            <p className="text-xs text-gray-400">Verified landlord</p>
          </div>
        </div>
        <ErrorAlert message={error} />
        <form onSubmit={submit}>
          <SectionTitle>Personal details</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">First name</label>
              <input name="first_name" value={form.first_name} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">Last name</label>
              <input name="last_name" value={form.last_name} onChange={handle} className="field-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">WhatsApp</label>
              <input name="whatsapp" type="tel" value={form.whatsapp} onChange={handle} className="field-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">National ID</label>
              <input name="national_id" value={form.national_id} onChange={handle} className="field-input" /></div>
          </div>
          <div className="mb-3">
            <label className="field-label">Preferred contact</label>
            <select name="preferred_contact" value={form.preferred_contact} onChange={handle} className="field-input">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="email">Email</option>
            </select>
          </div>

          <SectionTitle>Payment details</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Bank name</label>
              <input name="bank_name" value={form.bank_name} onChange={handle} className="field-input" placeholder="e.g. Equity Bank" /></div>
            <div><label className="field-label">Account number</label>
              <input name="bank_account" value={form.bank_account} onChange={handle} className="field-input" /></div>
          </div>
          <div className="mb-5">
            <label className="field-label">M-Pesa number</label>
            <input name="mpesa_number" type="tel" value={form.mpesa_number} onChange={handle} className="field-input" placeholder="+254 700 000 000" />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LandlordListings
