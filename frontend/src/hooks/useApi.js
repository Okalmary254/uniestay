import { useState, useEffect, useCallback, useRef } from 'react'

export default function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await apiFn()
      if (mountedRef.current) {
        setData(res?.results ?? res)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err.response?.data?.error ??
          err.response?.data?.detail ??
          err.message ??
          'Something went wrong.'
        )
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }

  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
