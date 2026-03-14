import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { propertiesAPI } from '../../api'
import { SectionTitle, Toast, ErrorAlert } from '../../components/UI'

const ALL_AMENITIES = [
  'WiFi', 'Water 24/7', 'Electricity', 'Security guard', 'CCTV',
  'Parking', 'Generator backup', 'Laundry area', 'Gym', 'Swimming pool',
  'DSTV', 'Kitchen', 'Ensuite bathroom', 'Furnished', 'Borehole', 'Lift / elevator',
]

export default function LandlordAddProperty() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', property_type: '', description: '',
    rent: '', deposit: '', available_from: '',
    address: '', neighbourhood: '', city: 'Nairobi',
    nearest_university: '', distance_to_campus: '', google_maps_link: '',
    bedrooms: 1, bathrooms: 1, max_occupants: 1,
  })
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [images,    setImages]    = useState([])
  const [toast,     setToast]     = useState('')
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleAmenity = (name) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const { data } = await propertiesAPI.create({ ...form, amenity_names: selectedAmenities })
      if (images.length > 0) {
        const fd = new FormData()
        images.forEach(img => fd.append('images', img))
        await propertiesAPI.uploadImages(data.id, fd)
      }
      setToast('Property listed! It is now visible to students.')
      setTimeout(() => navigate('/landlord/listings'), 2000)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not publish listing.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-base font-medium text-gray-900 mb-4">Add a property</h1>
      {toast  && <Toast message={toast} type="green" />}
      <ErrorAlert message={error} />

      <form onSubmit={submit}>
        <div className="card mb-4">
          <SectionTitle>Property images</SectionTitle>
          <label className="block border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 transition-colors bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Click to upload photos</p>
            <p className="text-xs text-gray-400">JPG, PNG · up to 5MB each · at least 3 recommended</p>
            <input type="file" multiple accept="image/*" className="hidden"
              onChange={e => setImages(Array.from(e.target.files))} />
          </label>
          {images.length > 0 && (
            <p className="text-xs text-teal-600 mt-2">{images.length} photo{images.length > 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div className="card mb-4">
          <SectionTitle>Property details</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Property title</label>
              <input name="title" value={form.title} onChange={handle} className="field-input"
                placeholder="e.g. Modern bedsitter in Westlands" required /></div>
            <div><label className="field-label">Property type</label>
              <select name="property_type" value={form.property_type} onChange={handle} className="field-input" required>
                <option value="">Select type</option>
                <option value="single_room">Single room</option>
                <option value="bedsitter">Bedsitter</option>
                <option value="1br">1 Bedroom</option>
                <option value="2br">2 Bedrooms</option>
                <option value="3br">3 Bedrooms</option>
                <option value="shared">Shared house</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div><label className="field-label">Monthly rent (KSh)</label>
              <input name="rent" type="number" value={form.rent} onChange={handle} className="field-input" placeholder="14000" required /></div>
            <div><label className="field-label">Deposit (KSh)</label>
              <input name="deposit" type="number" value={form.deposit} onChange={handle} className="field-input" placeholder="14000" /></div>
            <div><label className="field-label">Available from</label>
              <input name="available_from" type="date" value={form.available_from} onChange={handle} className="field-input" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div><label className="field-label">Bedrooms</label>
              <select name="bedrooms" value={form.bedrooms} onChange={handle} className="field-input">
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div><label className="field-label">Bathrooms</label>
              <select name="bathrooms" value={form.bathrooms} onChange={handle} className="field-input">
                <option value={0}>Shared</option>
                {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div><label className="field-label">Max occupants</label>
              <input name="max_occupants" type="number" value={form.max_occupants} onChange={handle} className="field-input" min={1} /></div>
          </div>
          <div><label className="field-label">Description</label>
            <textarea name="description" value={form.description} onChange={handle} className="field-input" rows={3}
              placeholder="Describe the property — size, condition, nearby landmarks, campus distance…" /></div>
        </div>

        <div className="card mb-4">
          <SectionTitle>Location</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Street address</label>
              <input name="address" value={form.address} onChange={handle} className="field-input" placeholder="e.g. 14 Ngong Road" /></div>
            <div><label className="field-label">Neighbourhood / Estate</label>
              <input name="neighbourhood" value={form.neighbourhood} onChange={handle} className="field-input" placeholder="e.g. Kilimani" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div><label className="field-label">City</label>
              <input name="city" value={form.city} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">Nearest university</label>
              <input name="nearest_university" value={form.nearest_university} onChange={handle} className="field-input" placeholder="e.g. UoN" /></div>
            <div><label className="field-label">Distance to campus</label>
              <input name="distance_to_campus" value={form.distance_to_campus} onChange={handle} className="field-input" placeholder="e.g. 10 min walk" /></div>
          </div>
          <div><label className="field-label">Google Maps link (optional)</label>
            <input name="google_maps_link" type="url" value={form.google_maps_link} onChange={handle} className="field-input" placeholder="https://maps.google.com/…" /></div>
        </div>

        <div className="card mb-4">
          <SectionTitle>Amenities</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs transition-colors
                  ${selectedAmenities.includes(a)
                    ? 'border-teal-400 bg-teal-50 text-teal-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}>
                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center
                  ${selectedAmenities.includes(a) ? 'bg-teal-400 border-teal-400 text-white' : 'border-gray-300'}`}>
                  {selectedAmenities.includes(a) && <span className="text-white text-xs leading-none">✓</span>}
                </span>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? 'Publishing…' : 'Publish listing'}
          </button>
          <button type="button" onClick={() => navigate('/landlord/listings')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
