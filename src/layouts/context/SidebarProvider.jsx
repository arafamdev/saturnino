import { useEffect, useReducer } from 'react'

import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
} from '../state/sidebarReducer'
import {
  loadSidebarPreferences,
  saveSidebarPreferences,
} from '../services/sidebarStorage'

import { SidebarContext } from './SidebarContext'

function SidebarProvider({ children }) {
  const [state, dispatch] = useReducer(
    sidebarReducer,
    initialSidebarState,
    loadSidebarPreferences,
  )

  function toggleSection(sectionId) {
    dispatch({
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: sectionId,
    })
  }

  function resetPreferences() {
    dispatch({
      type: sidebarActionTypes.RESET_PREFERENCES,
    })
  }

  useEffect(() => {
    saveSidebarPreferences(state)
  }, [state])

  const contextValue = {
    ...state,
    toggleSection,
    resetPreferences,
  }

  return <SidebarContext value={contextValue}>{children}</SidebarContext>
}

export default SidebarProvider
