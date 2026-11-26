import { describe, expect, it } from 'vitest'

import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
  sidebarSectionIds,
} from './sidebarReducer'

describe('sidebarReducer', () => {
  it('collapses an expanded section', () => {
    const nextState = sidebarReducer(initialSidebarState, {
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: sidebarSectionIds.FAVORITES,
    })

    expect(nextState.expandedSections.favorites).toBe(false)
  })

  it('expands a collapsed section', () => {
    const state = {
      ...initialSidebarState,
      expandedSections: {
        ...initialSidebarState.expandedSections,
        favorites: false,
      },
    }

    const nextState = sidebarReducer(state, {
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: sidebarSectionIds.FAVORITES,
    })

    expect(nextState.expandedSections.favorites).toBe(true)
  })

  it('preserves the state of other sections', () => {
    const nextState = sidebarReducer(initialSidebarState, {
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: sidebarSectionIds.FAVORITES,
    })

    expect(nextState.expandedSections.workspace).toBe(true)
    expect(nextState.expandedSections.recentProjects).toBe(true)
    expect(nextState.expandedSections.projectExplorer).toBe(true)
  })

  it('does not mutate the previous state', () => {
    const nextState = sidebarReducer(initialSidebarState, {
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: sidebarSectionIds.FAVORITES,
    })

    expect(nextState).not.toBe(initialSidebarState)
    expect(nextState.expandedSections).not.toBe(
      initialSidebarState.expandedSections,
    )

    expect(initialSidebarState.expandedSections.favorites).toBe(true)
  })

  it('ignores unknown section identifiers', () => {
    const nextState = sidebarReducer(initialSidebarState, {
      type: sidebarActionTypes.TOGGLE_SECTION,
      payload: 'unknownSection',
    })

    expect(nextState).toBe(initialSidebarState)
  })

  it('ignores unknown actions', () => {
    const nextState = sidebarReducer(initialSidebarState, {
      type: 'unknownAction',
    })

    expect(nextState).toBe(initialSidebarState)
  })

  it('resets preferences to their default values', () => {
    const state = {
      ...initialSidebarState,
      expandedSections: {
        ...initialSidebarState.expandedSections,
        favorites: false,
      },
    }

    const nextState = sidebarReducer(state, {
      type: sidebarActionTypes.RESET_PREFERENCES,
    })

    expect(nextState).toEqual(initialSidebarState)
  })
})
