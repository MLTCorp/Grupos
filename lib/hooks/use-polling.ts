'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UsePollingOptions {
  interval: number        // ms between polls (default 30000)
  enabled?: boolean       // whether polling is active
  onError?: (error: Error) => void
}

interface UsePollingResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for polling data at regular intervals
 *
 * Features:
 * - Automatic cleanup on unmount
 * - Pauses when tab is not visible
 * - Resumes when tab becomes visible
 * - Immediate fetch on mount, then at interval
 * - Manual refetch support
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions
): UsePollingResult<T> {
  const { interval, enabled = true, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)

  // Update fetcher ref to avoid stale closures
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  // Core fetch function
  const doFetch = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      const result = await fetcherRef.current()
      if (isMountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [onError])

  // Manual refetch
  const refetch = useCallback(async () => {
    setIsLoading(true)
    await doFetch()
  }, [doFetch])

  // Setup polling
  useEffect(() => {
    isMountedRef.current = true

    const clearPollingInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const startPolling = () => {
      clearPollingInterval()
      if (enabled && !document.hidden) {
        intervalRef.current = setInterval(doFetch, interval)
      }
    }

    // Visibility change handler - pause when tab hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPollingInterval()
      } else {
        // Immediate fetch when becoming visible, then restart interval
        doFetch()
        startPolling()
      }
    }

    if (enabled) {
      // Initial fetch
      doFetch()

      // Start polling only if tab is visible
      if (!document.hidden) {
        startPolling()
      }

      // Listen for visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Cleanup
    return () => {
      isMountedRef.current = false
      clearPollingInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, interval, doFetch])

  return { data, isLoading, error, refetch }
}
