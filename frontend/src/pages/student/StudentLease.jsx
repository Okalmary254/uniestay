import { useState, useEffect } from 'react'
import { bookingsAPI } from '../../api'
import { Spinner, InfoRow, SectionTitle, Badge } from '../../components/UI'

export default function StudentLease() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    bookingsAPI.list()
      .then(({ data }) => setBookings(data.results ?? data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active = bookings.find(b => b.status === 'accepted')
  const prop   = active?.property_detail

  if (!active) return (
    <div className="card text-center py-10">
      <p className="text-sm text-gray-400">No active lease found.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-base font-medium text-gray-900">Lease details</h1>
        <Badge status="accepted" />
      </div>

      <div className="card mb-4">
        <SectionTitle>Property information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Property"      value={prop?.title} />
            <InfoRow label="Unit"          value={active.unit_number || '—'} />
            <InfoRow label="Address"       value={prop?.address} />
            <InfoRow label="Nearest campus" value={prop ? `${prop.nearest_university} (${prop.distance_to_campus})` : '—'} />
          </div>
          <div>
            <InfoRow label="Type"          value={prop?.property_type?.replace('_', ' ')} />
            <InfoRow label="Bedrooms"      value={prop?.bedrooms} />
            <InfoRow label="Bathrooms"     value={prop?.bathrooms || 'Shared'} />
            <InfoRow label="Amenities"     value={prop?.amenities?.map(a => a.name).join(', ') || '—'} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <SectionTitle>Lease terms</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Move-in date"  value={active.move_in_date} />
            <InfoRow label="Lease end"     value={active.lease_end_date ?? '—'} />
            <InfoRow label="Duration"      value={`${active.duration_months} months`} />
          </div>
          <div>
            <InfoRow label="Monthly rent"  value={`KSh ${Number(prop?.rent ?? 0).toLocaleString()}`} />
            <InfoRow label="Deposit"       value={`KSh ${Number(prop?.deposit ?? 0).toLocaleString()}`} />
            <InfoRow label="Notice period" value="1 month" />
          </div>
        </div>
      </div>

      <div className="card">
        <SectionTitle>Landlord contact</SectionTitle>
        <InfoRow label="Phone"    value={prop?.landlord?.phone}   accent />
        <InfoRow label="WhatsApp" value={prop?.landlord?.whatsapp} accent />
        <InfoRow label="Email"    value={prop?.landlord?.email}   accent />
        <InfoRow label="Preferred contact" value={prop?.landlord?.preferred_contact || '—'} />
      </div>
    </div>
  )
}
