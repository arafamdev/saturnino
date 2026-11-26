export const sidebarSectionIds = {
  WORKSPACE: 'workspace',
  FAVORITES: 'favorites',
  RECENT_PROJECTS: 'recentProjects',
  PROJECT_EXPLORER: 'projectExplorer',
}

export const sidebarActionTypes = {
  TOGGLE_SECTION: 'sidebar/toggleSection',
  RESET_PREFERENCES: 'sidebar/resetPreferences',
}

export const initialSidebarState = {
  expandedSections: {
    [sidebarSectionIds.WORKSPACE]: true,
    [sidebarSectionIds.FAVORITES]: true,
    [sidebarSectionIds.RECENT_PROJECTS]: true,
    [sidebarSectionIds.PROJECT_EXPLORER]: true,
  },
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

    case sidebarActionTypes.RESET_PREFERENCES:
      return initialSidebarState

    default:
      return state
  }
}
