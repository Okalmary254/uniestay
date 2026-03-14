/**
 * useForm — lightweight form state manager
 *
 * Usage:
 *   const { values, handle, setValues, reset } = useForm({ name: '', email: '' })
 *
 *   <input name="email" value={values.email} onChange={handle} />
 */
import { useState, useCallback } from 'react'

export default function useForm(initial) {
  const [values, setValues] = useState(initial)

  const handle = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }, [])

  const reset = useCallback(() => setValues(initial), [initial])

  return { values, handle, setValues, reset }
}
