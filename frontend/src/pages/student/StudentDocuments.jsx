import { useState, useEffect } from 'react'
import { bookingsAPI } from '../../api'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Spinner, SectionTitle, Toast, ErrorAlert } from '../../components/UI'

export function StudentDocuments() {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    bookingsAPI.payments.list()
      .then(({ data }) => setPayments(data.results ?? data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const confirmedPayments = payments.filter(p => p.status === 'confirmed')

  return (
    <div>
      <h1 className="text-base font-medium text-gray-900 mb-4">My documents</h1>

      <div className="card mb-4">
        <SectionTitle>Lease & agreements</SectionTitle>
        {['Lease agreement', 'House rules & regulations', 'Deposit receipt'].map(doc => (
          <div key={doc} className="trow">
            <div>
              <p className="text-sm font-medium text-gray-800">{doc}</p>
              <p className="text-xs text-gray-400">PDF · Issued on move-in</p>
            </div>
            <button className="btn-secondary text-xs py-1.5 px-3">Download</button>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <SectionTitle>Payment receipts</SectionTitle>
        {confirmedPayments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No confirmed payments yet.</p>
        ) : confirmedPayments.map(p => (
          <div key={p.id} className="trow">
            <div>
              <p className="text-sm font-medium text-gray-800">{p.label} receipt</p>
              <p className="text-xs text-gray-400">{p.payment_date} · PDF</p>
            </div>
            <button className="btn-secondary text-xs py-1.5 px-3">Download</button>
          </div>
        ))}
      </div>

      <div className="card">
        <SectionTitle>Upload a document</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="field-label">Document type</label>
            <select className="field-input">
              <option>ID / Passport</option>
              <option>Student ID</option>
              <option>Bank statement</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="field-label">File</label>
            <input type="file" className="field-input text-xs py-1.5" />
          </div>
        </div>
        <button className="btn-blue text-xs">Upload document</button>
      </div>
    </div>
  )
}

export default StudentDocuments

export function StudentProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm]     = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    phone:      user?.phone      ?? '',
    email:      user?.email      ?? '',
    university: user?.university ?? '',
    student_id: user?.student_id ?? '',
    course:     user?.course     ?? '',
    year_of_study: user?.year_of_study ?? '',
    emergency_name:     user?.emergency_name ?? '',
    emergency_phone:    user?.emergency_phone ?? '',
    emergency_relation: user?.emergency_relation ?? '',
  })
  const [toast,   setToast]   = useState('')
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(form)
      updateUser(data)
      setToast('Profile saved successfully.')
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
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl font-medium text-blue-800">
            {initials}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{form.first_name} {form.last_name}</p>
            <p className="text-xs text-gray-400">Student · {user?.university || 'No university set'}</p>
          </div>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={submit}>
          <SectionTitle>Personal details</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">First name</label>
              <input name="first_name" value={form.first_name} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">Last name</label>
              <input name="last_name"  value={form.last_name}  onChange={handle} className="field-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="field-input" /></div>
          </div>

          <SectionTitle>Academic details</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">University</label>
              <input name="university" value={form.university} onChange={handle} className="field-input" placeholder="University of Nairobi" /></div>
            <div><label className="field-label">Student ID</label>
              <input name="student_id" value={form.student_id} onChange={handle} className="field-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="field-label">Course</label>
              <input name="course" value={form.course} onChange={handle} className="field-input" placeholder="BSc Computer Science" /></div>
            <div><label className="field-label">Year of study</label>
              <select name="year_of_study" value={form.year_of_study} onChange={handle} className="field-input">
                {['Year 1','Year 2','Year 3','Year 4','Postgraduate'].map(y =>
                  <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <SectionTitle>Emergency contact</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div><label className="field-label">Name</label>
              <input name="emergency_name" value={form.emergency_name} onChange={handle} className="field-input" /></div>
            <div><label className="field-label">Relationship</label>
              <input name="emergency_relation" value={form.emergency_relation} onChange={handle} className="field-input" placeholder="e.g. Mother" /></div>
            <div><label className="field-label">Phone</label>
              <input name="emergency_phone" type="tel" value={form.emergency_phone} onChange={handle} className="field-input" /></div>
          </div>

          <button type="submit" disabled={saving} className="btn-blue w-full">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
