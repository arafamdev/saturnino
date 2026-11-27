import { useEffect, useState } from 'react'

import { Outlet, useLocation, useNavigationType } from 'react-router'

import { NavigationHistoryContext } from './NavigationHistoryContext'
import {
  navigationEntry,
  recordNavigation,
  restoreNavigationJournal,
  saveNavigationJournal,
} from './navigationHistory'

function NavigationHistoryProvider() {
  const location = useLocation()
  const action = useNavigationType()
  const entry = navigationEntry(location)
  const [journal, setJournal] = useState(() => restoreNavigationJournal(entry))
  const currentJournal = recordNavigation(journal, entry, action)

  // Adjust before rendering children; blocked navigations keep Location unchanged.
  if (currentJournal !== journal) setJournal(currentJournal)

  useEffect(() => {
    saveNavigationJournal(currentJournal)
  }, [currentJournal])

  return (
    <NavigationHistoryContext value={currentJournal}>
      <Outlet />
    </NavigationHistoryContext>
  )
}

export default NavigationHistoryProvider
