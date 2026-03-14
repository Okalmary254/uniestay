import { useState, useEffect } from 'react'
import { bookingsAPI } from '../../api'
import { Spinner, Badge, StatCard, Toast, ErrorAlert, SectionTitle } from '../../components/UI'

export default function StudentPayments() {
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [toast,     setToast]     = useState('')
  const [error,     setError]     = useState('')
  const [submitting, setSub]      = useState(false)
  const [bookingId, setBookingId] = useState(null)

  const [form, setForm] = useState({
    label: '', amount: '', method: 'mpesa', reference: '', payment_date: '',
  })

  useEffect(() => {
    Promise.all([bookingsAPI.payments.list(), bookingsAPI.list()])
      .then(([p, b]) => {
        setPayments(p.data.results ?? p.data)
        const active = (b.data.results ?? b.data).find(bk => bk.status === 'accepted')
        if (active) setBookingId(active.id)
      })
      .finally(() => setLoading(false))
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!bookingId) { setError('No active booking found.'); return }
    setError(''); setSub(true)
    try {
      const { data } = await bookingsAPI.payments.create({ ...form, booking: bookingId })
      setPayments(prev => [data, ...prev])
      setToast('Payment recorded. Landlord will confirm once received.')
      setShowForm(false)
      setForm({ label: '', amount: '', method: 'mpesa', reference: '', payment_date: '' })
      setTimeout(() => setToast(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Could not record payment.')
    } finally {
      setSub(false)
    }
  }

  if (loading) return <Spinner />

  const confirmed = payments.filter(p => p.status === 'confirmed' && p.label !== 'Security deposit')
  const totalPaid = confirmed.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Total paid"   value={`KSh ${totalPaid.toLocaleString()}`} color="green" />
        <StatCard label="Payments"     value={confirmed.length} />
        <StatCard label="Outstanding"  value="KSh 0" color="default" />
      </div>

      {toast && <Toast message={toast} type="blue" onClose={() => setToast('')} />}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Payment history</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-blue text-xs">
          {showForm ? 'Cancel' : '+ Record payment'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <SectionTitle>Record a payment</SectionTitle>
          <ErrorAlert message={error} />
          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="field-label">Payment label</label>
                <input name="label" value={form.label} onChange={handle}
                  className="field-input" placeholder="e.g. April 2026 rent" required />
              </div>
              <div>
                <label className="field-label">Amount (KSh)</label>
                <input name="amount" type="number" value={form.amount} onChange={handle}
                  className="field-input" placeholder="13500" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="field-label">Method</label>
                <select name="method" value={form.method} onChange={handle} className="field-input">
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="field-label">Transaction reference</label>
                <input name="reference" value={form.reference} onChange={handle}
                  className="field-input" placeholder="e.g. QHJ4X9TK2M" />
              </div>
            </div>
            <div className="mb-4">
              <label className="field-label">Payment date</label>
              <input name="payment_date" type="date" value={form.payment_date} onChange={handle}
                className="field-input" required />
            </div>
            <button type="submit" disabled={submitting} className="btn-blue w-full">
              {submitting ? 'Submitting…' : 'Submit payment'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet.</p>
        ) : (
          payments.map(p => (
            <div key={p.id} className="trow">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.label}</p>
                <p className="text-xs text-gray-400">
                  {p.method?.replace('_', ' ')}
                  {p.reference && ` · ${p.reference}`}
                  {p.payment_date && ` · ${p.payment_date}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">KSh {Number(p.amount).toLocaleString()}</p>
                <Badge status={p.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
