import { useEffect } from 'react'
import { useLocation } from 'react-router'

function useScrollToLocation() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    // Scroll to the requested section after navigation.
    if (hash) {
      const sectionId = hash.slice(1)
      const targetSection = document.getElementById(sectionId)

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'instant' })
        return
      }
    }

    // Reset the scroll position when changing pages.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, key])
}

export default useScrollToLocation
