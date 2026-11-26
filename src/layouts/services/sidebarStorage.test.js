import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initialSidebarState } from '../state/sidebarReducer'

import {
  loadSidebarPreferences,
  saveSidebarPreferences,
} from './sidebarStorage'

const STORAGE_KEY = 'saturnino:sidebar-preferences'

describe('sidebarStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns default preferences when storage is empty', () => {
    expect(loadSidebarPreferences()).toEqual(initialSidebarState)
  })

  it('saves and restores sidebar preferences', () => {
    const preferences = {
      ...initialSidebarState,
      expandedSections: {
        ...initialSidebarState.expandedSections,
        favorites: false,
      },
    }

    expect(saveSidebarPreferences(preferences)).toBe(true)
    expect(loadSidebarPreferences()).toEqual(preferences)
  })

  it('returns default preferences when stored JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')

    expect(loadSidebarPreferences()).toEqual(initialSidebarState)
  })

  it('restores missing preferences using default values', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expandedSections: {
          favorites: false,
        },
      }),
    )

    expect(loadSidebarPreferences()).toEqual({
      ...initialSidebarState,
      expandedSections: {
        workspace: true,
        favorites: false,
        recentProjects: true,
        projectExplorer: true,
      },
      recentProjectIds: [],
    })
  })

  it('ignores invalid values and unknown sections', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expandedSections: {
          favorites: 'false',
          recentProjects: false,
          unknownSection: true,
        },
      }),
    )

    expect(loadSidebarPreferences()).toEqual({
      ...initialSidebarState,
      expandedSections: {
        workspace: true,
        favorites: true,
        recentProjects: false,
        projectExplorer: true,
      },
      recentProjectIds: [],
    })
  })

  it('returns default preferences when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    expect(loadSidebarPreferences()).toEqual(initialSidebarState)
  })

  it('returns false when preferences cannot be saved', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    expect(saveSidebarPreferences(initialSidebarState)).toBe(false)
  })
})
