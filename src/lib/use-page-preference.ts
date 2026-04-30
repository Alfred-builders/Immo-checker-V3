import { useEffect, useRef, useState } from 'react'
import { api } from './api-client'

// Loads /preferences/:page once on mount and merges into `defaults`.
// `update` patches the in-memory config and persists in the background.
// Concurrent updates are coalesced with a short debounce so several
// setStates in the same tick produce a single PUT.
export function usePagePreference<T extends object>(
  page: string,
  defaults: T,
): {
  config: T
  loaded: boolean
  update: (partial: Partial<T>) => void
} {
  const [config, setConfig] = useState<T>(defaults)
  const [loaded, setLoaded] = useState(false)
  const latest = useRef<T>(defaults)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    api<T | null>('/preferences/' + page, { skipAuthRedirect: true })
      .then((remote) => {
        if (cancelled) return
        if (remote && typeof remote === 'object') {
          const merged = { ...defaults, ...remote } as T
          latest.current = merged
          setConfig(merged)
        }
        setLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function update(partial: Partial<T>) {
    const next = { ...latest.current, ...partial } as T
    latest.current = next
    setConfig(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api('/preferences/' + page, {
        method: 'PUT',
        body: JSON.stringify({ config: latest.current }),
      }).catch(() => {})
    }, 250)
  }

  return { config, loaded, update }
}
