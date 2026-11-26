import { useCallback, useEffect, useReducer } from 'react'

import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
} from '../state/sidebarReducer'
import {
  loadSidebarPreferences,
  saveSidebarPreferences,
} from '../services/sidebarStorage'

import { useProjects } from '@/features/projects/hooks/useProjects'

import { SidebarContext, SidebarProjectsContext } from './SidebarContext'

function SidebarProvider({ children }) {
  const projectQuery = useProjects()

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

  const recordProjectAccess = useCallback((projectId) => {
    dispatch({
      type: sidebarActionTypes.RECORD_PROJECT_ACCESS,
      payload: projectId,
    })
  }, [])

  const pruneRecentProjects = useCallback((existingProjectIds) => {
    dispatch({
      type: sidebarActionTypes.PRUNE_RECENT_PROJECTS,
      payload: existingProjectIds,
    })
  }, [])

  useEffect(() => {
    saveSidebarPreferences(state)
  }, [state])

  const contextValue = {
    ...state,
    toggleSection,
    resetPreferences,
    recordProjectAccess,
    pruneRecentProjects,
  }

  return (
    <SidebarContext value={contextValue}>
      <SidebarProjectsContext value={projectQuery}>
        {children}
      </SidebarProjectsContext>
    </SidebarContext>
  )
}

export default SidebarProvider
