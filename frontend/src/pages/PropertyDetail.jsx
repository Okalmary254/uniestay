import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { propertiesAPI, bookingsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'
import { Spinner, Badge, ErrorAlert, Toast } from '../components/UI'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [booking, setBooking]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    move_in_date: '', duration_months: 12, message: '',
  })

  useEffect(() => {
    propertiesAPI.get(id)
      .then(({ data }) => setProperty(data))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false))
  }, [id])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setError(''); setSubmitting(true)
    try {
      await bookingsAPI.create({ property: property.id, ...form })
      setSuccess(true); setBooking(false)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Could not submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const emoji = { single_room: '🏠', bedsitter: '🏢', '1br': '🏗️', '2br': '🏙️', '3br': '🏬', shared: '🏘️' }

  if (loading) return <div className="min-h-screen bg-gray-50"><Topbar /><Spinner /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-3xl mx-auto px-5 py-6">
        <button onClick={() => navigate('/browse')} className="btn-secondary mb-4 text-xs">← Back to listings</button>

        {success && (
          <Toast
            message="Booking request sent! The landlord will contact you within 24 hours."
            type="green"
            onClose={() => setSuccess(false)}
          />
        )}

        <div className="card">
          {/* Hero image or emoji */}
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-6xl mb-5 overflow-hidden">
            {property.images?.length > 0
              ? <img src={property.images[0].image} alt={property.title} className="w-full h-full object-cover" />
              : emoji[property.property_type] ?? '🏠'}
          </div>

          <div className="flex items-start justify-between mb-1">
            <h1 className="text-xl font-medium text-gray-900">{property.title}</h1>
            <Badge status={property.status} />
          </div>
          <p className="text-sm text-gray-400 mb-5">
            {property.neighbourhood ? `${property.neighbourhood}, ` : ''}{property.city}
            {property.nearest_university && ` · Near ${property.nearest_university}`}
            {property.distance_to_campus && ` (${property.distance_to_campus})`}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="stat-card">
              <p className="text-xs text-gray-400 mb-1">Monthly rent</p>
              <p className="text-base font-medium text-teal-600">KSh {Number(property.rent).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-400 mb-1">Deposit</p>
              <p className="text-base font-medium text-gray-800">KSh {Number(property.deposit).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-400 mb-1">Available from</p>
              <p className="text-base font-medium text-gray-800">{property.available_from ?? 'Now'}</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{property.description}</p>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => (
                  <span key={a.id} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{a.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Landlord */}
          <div className="border-t border-gray-100 pt-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Listed by</p>
              <p className="text-sm font-medium text-gray-800">{property.landlord?.first_name} {property.landlord?.last_name}</p>
              {property.landlord?.phone && <a href={`tel:${property.landlord.phone}`} className="text-xs text-blue-500"> Call {property.landlord.phone}</a>}<br />
              {property.landlord.whatsapp && <a href={`https://wa.me/${property.landlord.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 ml-2">WhatsApp</a>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Beds / Baths</p>
              <p className="text-sm font-medium">{property.bedrooms} bed · {property.bathrooms || 'Shared'} bath</p>
            </div>
          </div>

          {/* CTA */}
          {!success && (
            property.status === 'active' ? (
              !booking ? (
                <button
                  onClick={() => { if (!user) navigate('/login'); else setBooking(true) }}
                  className="btn-primary w-full py-2.5"
                >
                  {user ? 'Book this place' : 'Sign in to book'}
                </button>
              ) : (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Request booking</h3>
                  <ErrorAlert message={error} />
                  <form onSubmit={submitBooking}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="field-label">Move-in date</label>
                        <input name="move_in_date" type="date" value={form.move_in_date}
                          onChange={handle} className="field-input" required />
                      </div>
                      <div>
                        <label className="field-label">Duration (months)</label>
                        <select name="duration_months" value={form.duration_months}
                          onChange={handle} className="field-input">
                          {[3,6,12,18,24].map(m => <option key={m} value={m}>{m} months</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="field-label">Message to landlord</label>
                      <textarea name="message" value={form.message} onChange={handle}
                        className="field-input" rows={3}
                        placeholder="Introduce yourself and mention anything relevant…" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting} className="btn-primary flex-1">
                        {submitting ? 'Sending…' : 'Confirm booking request'}
                      </button>
                      <button type="button" onClick={() => setBooking(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              )
            ) : (
              <p className="text-center text-sm text-gray-400 py-3">This property is currently not available for booking.</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}
