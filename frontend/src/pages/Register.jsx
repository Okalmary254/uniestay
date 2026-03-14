import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorAlert } from '../components/UI'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    role: 'student', phone: '', password: '', password2: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      const user = await register(form)
      navigate(user.role === 'landlord' ? '/landlord' : '/student', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data) setError(Object.values(data).flat().join(' '))
      else setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-xl font-semibold">UniStay</span>
        </div>

        <div className="card">
          <h1 className="text-lg font-medium text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-400 mb-6">Join as a student or landlord</p>

          <ErrorAlert message={error} />

          <form onSubmit={submit}>
            {/* Role selector */}
            <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-lg">
              {['student', 'landlord'].map((r) => (
                <button
                  key={r} type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 text-sm rounded-md transition-colors capitalize font-medium
                    ${form.role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="field-label">First name</label>
                <input name="first_name" value={form.first_name} onChange={handle}
                  className="field-input" placeholder="Amina" required />
              </div>
              <div>
                <label className="field-label">Last name</label>
                <input name="last_name" value={form.last_name} onChange={handle}
                  className="field-input" placeholder="Kariuki" required />
              </div>
            </div>

            <div className="mb-3">
              <label className="field-label">Username</label>
              <input name="username" value={form.username} onChange={handle}
                className="field-input" placeholder="amina_kariuki" required />
            </div>
            <div className="mb-3">
              <label className="field-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="field-input" placeholder="0000@students.mnu.ac.ke" required />
            </div>
            <div className="mb-3">
              <label className="field-label">Phone number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handle}
                className="field-input" placeholder="+254 712 456 789" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="field-label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handle}
                  className="field-input" placeholder="Min 8 characters" required />
              </div>
              <div>
                <label className="field-label">Confirm password</label>
                <input name="password2" type="password" value={form.password2} onChange={handle}
                  className="field-input" placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : `Create ${form.role} account`}
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
