import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from '../../components/Topbar'
import Sidebar from '../../components/Sidebar'
import LandlordOverview    from './LandlordOverview'
import LandlordAddProperty from './LandlordAddProperty'
import LandlordListings    from './LandlordListings'
import LandlordBookings    from './LandlordBookings'
import LandlordMaintenance from './LandlordMaintenance'
import LandlordProfile     from './LandlordProfile'

const NAV = [
  { to: '/landlord',             label: 'Overview' },
  { to: '/landlord/add',         label: 'Add property' },
  { to: '/landlord/listings',    label: 'My listings' },
  { to: '/landlord/bookings',    label: 'Bookings' },
  { to: '/landlord/maintenance', label: 'Maintenance' },
  { to: '/landlord/profile',     label: 'My profile' },
]

export default function LandlordDash() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex" style={{ minHeight: 'calc(100vh - 52px)' }}>
        <Sidebar items={NAV} role="landlord" />
        <main className="flex-1 p-5 overflow-y-auto">
          <Routes>
            <Route index                   element={<LandlordOverview />} />
            <Route path="add"              element={<LandlordAddProperty />} />
            <Route path="listings"         element={<LandlordListings />} />
            <Route path="bookings"         element={<LandlordBookings />} />
            <Route path="maintenance"      element={<LandlordMaintenance />} />
            <Route path="profile"          element={<LandlordProfile />} />
            <Route path="*"                element={<Navigate to="/landlord" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
