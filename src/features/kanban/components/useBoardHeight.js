import { useLayoutEffect } from 'react'

export function useBoardHeight(ref) {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    function measure() {
      const top = element.getBoundingClientRect().top + window.scrollY
      const height = Math.max(320, window.innerHeight - top - 24)
      element.style.setProperty('--board-height', `${height}px`)
    }
    measure()
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    observer?.observe(element.parentElement)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref])
}
