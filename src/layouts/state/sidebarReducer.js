export const MIN_SIDEBAR_WIDTH = 224
export const MAX_SIDEBAR_WIDTH = 400
export const DEFAULT_SIDEBAR_WIDTH = 256

export function normalizeSidebarWidth(width) {
  return typeof width === 'number' && Number.isFinite(width)
    ? Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)),
      )
    : DEFAULT_SIDEBAR_WIDTH
}

export const MAX_RECENT_PROJECTS = 5

export const sidebarSectionIds = {
  WORKSPACE: 'workspace',
  FAVORITES: 'favorites',
  RECENT_PROJECTS: 'recentProjects',
  PROJECT_EXPLORER: 'projectExplorer',
}

export const sidebarActionTypes = {
  SET_WIDTH: 'sidebar/setWidth',
  SET_COMPACT: 'sidebar/setCompact',
  SET_VISIBILITY: 'sidebar/setVisibility',
  MOVE_SECTION: 'sidebar/moveSection',
  APPLY_CUSTOMIZATION: 'sidebar/applyCustomization',
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
  sectionOrder: Object.values(sidebarSectionIds),
  hiddenSections: [],
  width: DEFAULT_SIDEBAR_WIDTH,
  compact: false,
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

export function normalizeSidebarCustomization(preferences) {
  const validIds = initialSidebarState.sectionOrder
  return {
    sectionOrder: [
      ...new Set([
        ...(Array.isArray(preferences?.sectionOrder)
          ? preferences.sectionOrder
          : []
        ).filter((id) => validIds.includes(id)),
        ...validIds,
      ]),
    ],
    hiddenSections: [
      ...new Set(
        (Array.isArray(preferences?.hiddenSections)
          ? preferences.hiddenSections
          : []
        ).filter((id) => id !== 'workspace' && validIds.includes(id)),
      ),
    ],
  }
}

export function sidebarReducer(state, action) {
  switch (action.type) {
    case sidebarActionTypes.APPLY_CUSTOMIZATION:
      // Commit only draft-owned fields; visits/width may change while it is open.
      return {
        ...(action.payload?.reset ? initialSidebarState : state),
        ...normalizeSidebarCustomization(action.payload),
      }
    case sidebarActionTypes.SET_WIDTH:
      return { ...state, width: normalizeSidebarWidth(action.payload) }
    case sidebarActionTypes.SET_COMPACT:
      return typeof action.payload === 'boolean'
        ? { ...state, compact: action.payload }
        : state

    case sidebarActionTypes.SET_VISIBILITY: {
      const { sectionId, visible } = action.payload
      if (
        sectionId === 'workspace' ||
        !Object.values(sidebarSectionIds).includes(sectionId)
      )
        return state
      return {
        ...state,
        hiddenSections: visible
          ? state.hiddenSections.filter((id) => id !== sectionId)
          : [...new Set([...state.hiddenSections, sectionId])],
      }
    }
    case sidebarActionTypes.MOVE_SECTION: {
      const { sectionId, targetId } = action.payload
      const sectionOrder = [...state.sectionOrder]
      const from = sectionOrder.indexOf(sectionId)
      const to = sectionOrder.indexOf(targetId)
      if (from < 0 || to < 0 || from === to) return state
      sectionOrder.splice(from, 1)
      sectionOrder.splice(to, 0, sectionId)
      return { ...state, sectionOrder }
    }

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
      // Only prune IDs observed by this read; newer visits may arrive before it resolves.
      const existingIds = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.existingProjectIds
      const observedIds = Array.isArray(action.payload)
        ? state.recentProjectIds
        : action.payload?.observedProjectIds
      if (!Array.isArray(existingIds) || !Array.isArray(observedIds))
        return state
      const existingProjectIds = new Set(existingIds)
      const observedProjectIds = new Set(observedIds)
      const recentProjectIds = state.recentProjectIds.filter(
        (projectId) =>
          !observedProjectIds.has(projectId) ||
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
