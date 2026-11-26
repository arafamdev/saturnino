export const MAX_RECENT_PROJECTS = 5

export const sidebarSectionIds = {
  WORKSPACE: 'workspace',
  FAVORITES: 'favorites',
  RECENT_PROJECTS: 'recentProjects',
  PROJECT_EXPLORER: 'projectExplorer',
}

export const sidebarActionTypes = {
  TOGGLE_SECTION: 'sidebar/toggleSection',
  RESET_PREFERENCES: 'sidebar/resetPreferences',
  RECORD_PROJECT_ACCESS: 'sidebar/recordProjectAccess',
  PRUNE_RECENT_PROJECTS: 'sidebar/pruneRecentProjects',
}

export const initialSidebarState = {
  expandedSections: {
    [sidebarSectionIds.WORKSPACE]: true,
    [sidebarSectionIds.FAVORITES]: true,
    [sidebarSectionIds.RECENT_PROJECTS]: true,
    [sidebarSectionIds.PROJECT_EXPLORER]: true,
  },
  recentProjectIds: [],
}

export function normalizeRecentProjectIds(projectIds) {
  if (!Array.isArray(projectIds)) {
    return []
  }

  return [
    ...new Set(
      projectIds.filter(
        (projectId) =>
          typeof projectId === 'string' && projectId.trim().length > 0,
      ),
    ),
  ].slice(0, MAX_RECENT_PROJECTS)
}

export function sidebarReducer(state, action) {
  switch (action.type) {
    case sidebarActionTypes.TOGGLE_SECTION: {
      const sectionId = action.payload

      if (!Object.hasOwn(state.expandedSections, sectionId)) {
        return state
      }

      return {
        ...state,
        expandedSections: {
          ...state.expandedSections,
          [sectionId]: !state.expandedSections[sectionId],
        },
      }
    }

    case sidebarActionTypes.RECORD_PROJECT_ACCESS: {
      const projectId = action.payload

      if (typeof projectId !== 'string' || projectId.trim().length === 0) {
        return state
      }

      if (state.recentProjectIds[0] === projectId) {
        return state
      }

      return {
        ...state,
        recentProjectIds: normalizeRecentProjectIds([
          projectId,
          ...state.recentProjectIds,
        ]),
      }
    }

    case sidebarActionTypes.PRUNE_RECENT_PROJECTS: {
      if (!Array.isArray(action.payload)) {
        return state
      }

      const existingProjectIds = new Set(action.payload)

      const recentProjectIds = state.recentProjectIds.filter((projectId) =>
        existingProjectIds.has(projectId),
      )

      if (recentProjectIds.length === state.recentProjectIds.length) {
        return state
      }

      return {
        ...state,
        recentProjectIds,
      }
    }

    case sidebarActionTypes.RESET_PREFERENCES:
      return initialSidebarState

    default:
      return state
  }
}
