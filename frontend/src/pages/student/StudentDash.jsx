import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from '../../components/Topbar'
import Sidebar from '../../components/Sidebar'
import StudentOverview    from './StudentOverview'
import StudentLease       from './StudentLease'
import StudentPayments    from './StudentPayments'
import StudentMaintenance from './StudentMaintenance'
import StudentDocuments   from './StudentDocuments'
import StudentProfile     from './StudentProfile'

const NAV = [
  { to: '/student',              label: 'Overview' },
  { to: '/student/lease',        label: 'My lease' },
  { to: '/student/payments',     label: 'Payments' },
  { to: '/student/maintenance',  label: 'Maintenance' },
  { to: '/student/documents',    label: 'Documents' },
  { to: '/student/profile',      label: 'My profile' },
]

export default function StudentDash() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex" style={{ minHeight: 'calc(100vh - 52px)' }}>
        <Sidebar items={NAV} role="student" />
        <main className="flex-1 p-5 overflow-y-auto">
          <Routes>
            <Route index                  element={<StudentOverview />} />
            <Route path="lease"           element={<StudentLease />} />
            <Route path="payments"        element={<StudentPayments />} />
            <Route path="maintenance"     element={<StudentMaintenance />} />
            <Route path="documents"       element={<StudentDocuments />} />
            <Route path="profile"         element={<StudentProfile />} />
            <Route path="*"               element={<Navigate to="/student" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
