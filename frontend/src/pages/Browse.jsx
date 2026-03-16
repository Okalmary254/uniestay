import { useState, useEffect, useRef } from 'react'
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

const UNIVERSITIES = [
  'Catholic University of Eastern Africa',
  'Cooperative University of Kenya',
  'Daystar University',
  'Dedan Kimathi University',
  'Egerton University',
  'JKUAT',
  'Jaramogi Oginga Odinga University of Science and Technology',
  'KCA University',
  'Kabarak University',
  'Kabianga University',
  'Kenyatta University',
  'Karatina University',
  'kisii University',
  'Kibabii University',
  'Kirinyaga University',
  'Maasai Mara University',
  'Mama Ngina University',
  'Maseno University',
  'Moi University',
  'Mount Kenya University',
  'Multimedia University of Kenya',
  'Open University of Kenya',
  'Strathmore University',
  'Technical University of Kenya',
  'Technical University of Mombasa',
  'United States International University',
  'University of Nairobi',
  'University of Eldoret',
  'University of Embu',
  'Zetech University',
]

export default function Browse() {
  const navigate = useNavigate()
  const [properties, setProperties]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('')
  const [maxRent, setMaxRent]         = useState('')
  const [uniFilter, setUniFilter]     = useState('')
  const [uniInput, setUniInput]       = useState('')
  const [showDrop, setShowDrop]       = useState(false)
  const dropRef                       = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = UNIVERSITIES.filter(u =>
    u.toLowerCase().includes(uniInput.toLowerCase())
  )

  const selectUni = (uni) => {
    setUniFilter(uni)
    setUniInput(uni)
    setShowDrop(false)
  }

  const clearUni = () => {
    setUniFilter('')
    setUniInput('')
  }

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)     params.search        = search
      if (typeFilter) params.property_type = typeFilter
      if (uniFilter)  params.search        = uniFilter  // nearest_university is a search field
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

        {/* Hero search card */}
        <div className="card mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Find your student home</h1>
          <p className="text-sm text-gray-400 mb-5">
            Verified rentals near your university — affordable, safe, move-in ready.
          </p>

          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">

            {/* Free-text search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by area…"
              className="field-input flex-1 min-w-36"
            />

            {/* University dropdown */}
            <div className="relative min-w-52" ref={dropRef}>
              <div className="relative">
                <input
                  value={uniInput}
                  onChange={(e) => { setUniInput(e.target.value); setUniFilter(''); setShowDrop(true) }}
                  onFocus={() => setShowDrop(true)}
                  placeholder="Select university…"
                  className="field-input w-full pr-8"
                />
                {/* Clear button */}
                {uniInput && (
                  <button
                    type="button"
                    onClick={clearUni}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
                {/* Chevron */}
                {!uniInput && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                    ▾
                  </span>
                )}
              </div>

              {/* Dropdown list */}
              {showDrop && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {/* "Any university" option */}
                  <li
                    onClick={() => { clearUni(); setShowDrop(false) }}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    Any university
                  </li>

                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-400 italic">No matches</li>
                  ) : (
                    filtered.map(uni => (
                      <li
                        key={uni}
                        onClick={() => selectUni(uni)}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700 transition-colors
                          ${uniFilter === uni ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'}`}
                      >
                        {uni}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Property type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="field-input w-36"
            >
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {/* Max rent */}
            <input
              type="number"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              placeholder="Max rent (KSh)"
              className="field-input w-36"
            />

            <button type="submit" className="btn-primary px-6">Search</button>
          </form>

          {/* Active filter chips */}
          {(uniFilter || typeFilter || maxRent) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 self-center">Filters:</span>
              {uniFilter && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full">
                  {uniFilter}
                  <button onClick={clearUni} className="hover:text-teal-900 font-medium">×</button>
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full">
                  {TYPES.find(t => t.value === typeFilter)?.label}
                  <button onClick={() => setTypeFilter('')} className="hover:text-teal-900 font-medium">×</button>
                </span>
              )}
              {maxRent && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full">
                  Max KSh {Number(maxRent).toLocaleString()}
                  <button onClick={() => setMaxRent('')} className="hover:text-teal-900 font-medium">×</button>
                </span>
              )}
              <button
                onClick={() => { clearUni(); setTypeFilter(''); setMaxRent(''); setSearch('') }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          {loading ? 'Loading…' : `${properties.length} listing${properties.length !== 1 ? 's' : ''} available`}
        </p>

        {/* Results grid */}
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