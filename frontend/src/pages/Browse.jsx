import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { propertiesAPI } from '../api'
import Topbar from '../components/Topbar'
import { PropertyCard, Spinner, Empty } from '../components/UI'

const TYPES = [
  { value: '', label: 'Any type' },
  { value: 'single_room', label: 'Single room' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedrooms' },
]

export default function Browse() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [maxRent, setMaxRent]       = useState('')

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)     params.search   = search
      if (typeFilter) params.property_type = typeFilter
      const { data } = await propertiesAPI.list(params)
      let results = data.results ?? data
      if (maxRent) results = results.filter(p => Number(p.rent) <= Number(maxRent))
      setProperties(results)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, [])

  const handleSearch = (e) => { e.preventDefault(); fetchProperties() }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Hero search */}
        <div className="card mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Find your student home</h1>
          <p className="text-sm text-gray-400 mb-5">Verified rentals near your university — affordable, safe, move-in ready.</p>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by area or university…"
              className="field-input flex-1 min-w-40"
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="field-input w-36">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input
              type="number" value={maxRent} onChange={(e) => setMaxRent(e.target.value)}
              placeholder="Max rent (KSh)"
              className="field-input w-36"
            />
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>
        </div>

        {/* Results */}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          {loading ? 'Loading…' : `${properties.length} listing${properties.length !== 1 ? 's' : ''} available`}
        </p>

        {loading ? (
          <Spinner />
        ) : properties.length === 0 ? (
          <Empty message="No listings match your search. Try adjusting your filters." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {properties.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                onClick={() => navigate(`/browse/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
