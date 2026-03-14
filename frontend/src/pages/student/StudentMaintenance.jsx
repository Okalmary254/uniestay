import { useState, useEffect } from 'react'
import { bookingsAPI, maintenanceAPI } from '../../api'
import { Spinner, PriorityBadge, Badge, Toast, ErrorAlert, SectionTitle } from '../../components/UI'

const CATEGORIES = [
  { value: 'plumbing',      label: 'Plumbing',       icon: '🔧' },
  { value: 'electrical',    label: 'Electrical',     icon: '⚡' },
  { value: 'furniture',     label: 'Furniture',      icon: '🪑' },
  { value: 'appliances',    label: 'Appliances',     icon: '📺' },
  { value: 'doors_locks',   label: 'Doors & locks',  icon: '🔐' },
  { value: 'walls_ceiling', label: 'Walls & ceiling',icon: '🏗️' },
  { value: 'pest_control',  label: 'Pest control',   icon: '🐜' },
  { value: 'other',         label: 'Other',          icon: '📋' },
]

export default function StudentMaintenance() {
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [propId,    setPropId]    = useState(null)
  const [toast,     setToast]     = useState('')
  const [error,     setError]     = useState('')
  const [submitting, setSub]      = useState(false)

  const [form, setForm] = useState({
    title: '', category: '', priority: 'medium', description: '',
    location_in_unit: '', preferred_visit_time: 'any',
  })

  useEffect(() => {
    Promise.all([maintenanceAPI.list(), bookingsAPI.list()])
      .then(([m, b]) => {
        setRequests(m.data.results ?? m.data)
        const active = (b.data.results ?? b.data).find(bk => bk.status === 'accepted')
        if (active) setPropId(active.property)
      })
      .finally(() => setLoading(false))
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!propId) { setError('No active lease found. You need an active lease to submit maintenance requests.'); return }
    if (!form.category) { setError('Please select a category.'); return }
    setError(''); setSub(true)
    try {
      const { data } = await maintenanceAPI.create({ ...form, property: propId })
      setRequests(prev => [data, ...prev])
      setToast('Request submitted. Your landlord has been notified.')
      setShowForm(false)
      setForm({ title: '', category: '', priority: 'medium', description: '', location_in_unit: '', preferred_visit_time: 'any' })
      setTimeout(() => setToast(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Could not submit request.')
    } finally {
      setSub(false)
    }
  }

  if (loading) return <Spinner />

  const open     = requests.filter(r => r.status !== 'resolved')
  const resolved = requests.filter(r => r.status === 'resolved')

  const priorityBorder = { high: 'border-l-red-400', medium: 'border-l-amber-400', low: 'border-l-teal-400' }

  return (
    <div>
      {toast && <Toast message={toast} type="blue" onClose={() => setToast('')} />}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-medium text-gray-900">Maintenance requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-blue text-xs">
          {showForm ? 'Cancel' : '+ New request'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <SectionTitle>Submit a maintenance request</SectionTitle>
          <ErrorAlert message={error} />

          {/* Category grid */}
          <p className="field-label mb-2">Category</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {CATEGORIES.map(c => (
              <button
                key={c.value} type="button"
                onClick={() => setForm({ ...form, category: c.value })}
                className={`p-2 text-center border rounded-lg text-xs transition-colors
                  ${form.category === c.value
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
              >
                <div className="text-lg mb-1">{c.icon}</div>
                {c.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="field-label">Issue title</label>
                <input name="title" value={form.title} onChange={handle}
                  className="field-input" placeholder="e.g. Leaking kitchen tap" required />
              </div>
              <div>
                <label className="field-label">Priority</label>
                <select name="priority" value={form.priority} onChange={handle} className="field-input">
                  <option value="low">Low — not urgent</option>
                  <option value="medium">Medium — affects comfort</option>
                  <option value="high">High — urgent / safety risk</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="field-label">Description</label>
              <textarea name="description" value={form.description} onChange={handle}
                className="field-input" rows={3}
                placeholder="Describe the problem — when it started, how bad it is…" required />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="field-label">Location in unit</label>
                <input name="location_in_unit" value={form.location_in_unit} onChange={handle}
                  className="field-input" placeholder="e.g. Kitchen, Bathroom" />
              </div>
              <div>
                <label className="field-label">Best time for visit</label>
                <select name="preferred_visit_time" value={form.preferred_visit_time} onChange={handle} className="field-input">
                  <option value="morning">Morning (8am–12pm)</option>
                  <option value="afternoon">Afternoon (12pm–5pm)</option>
                  <option value="evening">Evening (5pm–8pm)</option>
                  <option value="any">Any time</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-blue w-full">
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        </div>
      )}

      {/* Open requests */}
      <p className="text-xs text-gray-400 mb-2">Open ({open.length})</p>
      {open.length === 0 ? (
        <div className="card text-center py-6 mb-4">
          <p className="text-sm text-gray-400">No open requests. All clear!</p>
        </div>
      ) : (
        open.map(r => (
          <div key={r.id}
            className={`card border-l-4 mb-3 ${priorityBorder[r.priority] ?? 'border-l-gray-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">{r.title}</p>
              <PriorityBadge priority={r.priority} />
            </div>
            <p className="text-xs text-gray-400 mb-1">
              {r.category?.replace('_', ' ')} · {r.created_at?.slice(0, 10)} · <Badge status={r.status} />
            </p>
            {r.technician_note && (
              <p className="text-xs text-gray-500 mt-1 italic">{r.technician_note}</p>
            )}
          </div>
        ))
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-2 mt-4">Resolved ({resolved.length})</p>
          {resolved.map(r => (
            <div key={r.id} className="card border-l-4 border-l-gray-200 mb-3 opacity-60">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{r.title}</p>
                <Badge status="resolved" />
              </div>
              <p className="text-xs text-gray-400">{r.category?.replace('_', ' ')} · {r.technician_note}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
