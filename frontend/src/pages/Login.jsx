import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorAlert } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'landlord' ? '/landlord' : '/student', { replace: true })
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] ?? 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-xl font-semibold">UniStay</span>
        </div>

        <div className="card">
          <h1 className="text-lg font-medium text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

          <ErrorAlert message={error} />

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label">Username</label>
              <input name="username" value={form.username} onChange={handle}
                className="field-input" placeholder="your_username" required autoFocus />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="field-input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-4">
            No account?{' '}
            <Link to="/register" className="text-teal-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
