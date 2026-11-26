import { useEffect, useState } from 'react'
import { getTodayDateOnly } from './dateOnly'

export function useTodayDateOnly() {
  const [today, setToday] = useState(getTodayDateOnly)
  useEffect(() => {
    let timeout
    function schedule() {
      clearTimeout(timeout)
      const now = new Date()
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )
      timeout = setTimeout(refresh, midnight.getTime() - now.getTime() + 100)
    }
    function refresh() {
      setToday(getTodayDateOnly())
      schedule()
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') refresh()
    }
    schedule()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
  return today
}
