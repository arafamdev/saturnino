import { useCallback, useEffect, useReducer } from 'react'

import { useProjects } from '@/features/projects/hooks/useProjects'

import { usePruneRecentProjects } from '../hooks/usePruneRecentProjects'

import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
} from '../state/sidebarReducer'
import {
  loadSidebarPreferences,
  saveSidebarPreferences,
} from '../services/sidebarStorage'

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

  const pruneRecentProjects = useCallback(
    (existingProjectIds, observedProjectIds) => {
      dispatch({
        type: sidebarActionTypes.PRUNE_RECENT_PROJECTS,
        payload: { existingProjectIds, observedProjectIds },
      })
    },
    [],
  )

  usePruneRecentProjects(
    projectQuery,
    state.recentProjectIds,
    pruneRecentProjects,
  )

  useEffect(() => {
    saveSidebarPreferences(state)
  }, [state])

  const contextValue = {
    ...state,
    applyCustomization: (draft) =>
      dispatch({
        type: sidebarActionTypes.APPLY_CUSTOMIZATION,
        payload: draft,
      }),
    setWidth: (width) =>
      dispatch({ type: sidebarActionTypes.SET_WIDTH, payload: width }),
    setCompact: (compact) =>
      dispatch({ type: sidebarActionTypes.SET_COMPACT, payload: compact }),
    setSectionVisible: (sectionId, visible) =>
      dispatch({
        type: sidebarActionTypes.SET_VISIBILITY,
        payload: { sectionId, visible },
      }),
    moveSection: (sectionId, targetId) =>
      dispatch({
        type: sidebarActionTypes.MOVE_SECTION,
        payload: { sectionId, targetId },
      }),
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
