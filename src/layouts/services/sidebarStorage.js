import {
  initialSidebarState,
  normalizeSidebarWidth,
  normalizeRecentProjectIds,
  normalizeSidebarCustomization,
} from '../state/sidebarReducer'

const SIDEBAR_STORAGE_KEY = 'saturnino:sidebar-preferences'

export function loadSidebarPreferences() {
  try {
    const storedPreferences = localStorage.getItem(SIDEBAR_STORAGE_KEY)

    if (!storedPreferences) {
      return initialSidebarState
    }

    const parsedPreferences = JSON.parse(storedPreferences)

    const expandedSections = Object.fromEntries(
      Object.entries(initialSidebarState.expandedSections).map(
        ([sectionId, defaultValue]) => {
          const storedValue = parsedPreferences?.expandedSections?.[sectionId]

          return [
            sectionId,
            typeof storedValue === 'boolean' ? storedValue : defaultValue,
          ]
        },
      ),
    )

    return {
      ...initialSidebarState,
      expandedSections,
      width: normalizeSidebarWidth(parsedPreferences?.width),
      compact:
        typeof parsedPreferences?.compact === 'boolean'
          ? parsedPreferences.compact
          : false,
      ...normalizeSidebarCustomization(parsedPreferences),
      recentProjectIds: normalizeRecentProjectIds(
        parsedPreferences?.recentProjectIds,
      ),
    }
  } catch {
    // Invalid or unavailable storage must not prevent navigation.
    return initialSidebarState
  }
}

export function saveSidebarPreferences(preferences) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(preferences))

    return true
  } catch {
    return false
  }
}
