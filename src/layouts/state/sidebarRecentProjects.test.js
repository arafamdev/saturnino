import { beforeEach, describe, expect, it } from 'vitest'

import {
  loadSidebarPreferences,
  saveSidebarPreferences,
} from '../services/sidebarStorage'

import {
  initialSidebarState,
  normalizeRecentProjectIds,
  sidebarActionTypes,
  sidebarReducer,
} from './sidebarReducer'

function recordAccess(state, projectId) {
  return sidebarReducer(state, {
    type: sidebarActionTypes.RECORD_PROJECT_ACCESS,
    payload: projectId,
  })
}

describe('Recent project history', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with an empty recent project history', () => {
    expect(initialSidebarState.recentProjectIds).toEqual([])
  })

  it('records a visited project', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    expect(state.recentProjectIds).toEqual(['project-1'])
  })

  it('places the most recently visited project first', () => {
    const firstState = recordAccess(initialSidebarState, 'project-1')
    const secondState = recordAccess(firstState, 'project-2')

    expect(secondState.recentProjectIds).toEqual(['project-2', 'project-1'])
  })

  it('moves an existing project to the beginning without duplicates', () => {
    const state = {
      ...initialSidebarState,
      recentProjectIds: ['project-3', 'project-2', 'project-1'],
    }

    const nextState = recordAccess(state, 'project-1')

    expect(nextState.recentProjectIds).toEqual([
      'project-1',
      'project-3',
      'project-2',
    ])
  })

  it('limits the history to five projects', () => {
    const projectIds = [
      'project-1',
      'project-2',
      'project-3',
      'project-4',
      'project-5',
      'project-6',
    ]

    const state = projectIds.reduce(recordAccess, initialSidebarState)

    expect(state.recentProjectIds).toEqual([
      'project-6',
      'project-5',
      'project-4',
      'project-3',
      'project-2',
    ])
  })

  it('preserves the state when the latest project is visited again', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    expect(recordAccess(state, 'project-1')).toBe(state)
  })

  it('ignores invalid project identifiers', () => {
    for (const projectId of [null, undefined, 123, '', '   ']) {
      expect(recordAccess(initialSidebarState, projectId)).toBe(
        initialSidebarState,
      )
    }
  })

  it('does not mutate the previous state', () => {
    const state = {
      ...initialSidebarState,
      recentProjectIds: ['project-1'],
    }

    const nextState = recordAccess(state, 'project-2')

    expect(state.recentProjectIds).toEqual(['project-1'])

    expect(nextState.recentProjectIds).not.toBe(state.recentProjectIds)
  })

  it('preserves expanded section preferences', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    expect(state.expandedSections).toBe(initialSidebarState.expandedSections)
  })

  it('removes references to deleted projects', () => {
    const state = {
      ...initialSidebarState,
      recentProjectIds: ['project-3', 'project-2', 'project-1'],
    }

    const nextState = sidebarReducer(state, {
      type: sidebarActionTypes.PRUNE_RECENT_PROJECTS,
      payload: ['project-1', 'project-3'],
    })

    expect(nextState.recentProjectIds).toEqual(['project-3', 'project-1'])
  })

  it('preserves the state when all recent projects still exist', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    expect(
      sidebarReducer(state, {
        type: sidebarActionTypes.PRUNE_RECENT_PROJECTS,
        payload: ['project-1', 'project-2'],
      }),
    ).toBe(state)
  })

  it('normalizes invalid and duplicate stored identifiers', () => {
    expect(
      normalizeRecentProjectIds([
        'project-1',
        null,
        'project-1',
        123,
        '',
        'project-2',
      ]),
    ).toEqual(['project-1', 'project-2'])
  })

  it('persists and restores the recent project history', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    expect(saveSidebarPreferences(state)).toBe(true)

    expect(loadSidebarPreferences().recentProjectIds).toEqual(['project-1'])
  })

  it('supports preferences saved before recent projects existed', () => {
    localStorage.setItem(
      'saturnino:sidebar-preferences',
      JSON.stringify({
        expandedSections: {
          workspace: false,
        },
      }),
    )

    const state = loadSidebarPreferences()

    expect(state.recentProjectIds).toEqual([])
    expect(state.expandedSections.workspace).toBe(false)
  })

  it('normalizes corrupted recent project history', () => {
    localStorage.setItem(
      'saturnino:sidebar-preferences',
      JSON.stringify({
        recentProjectIds: 'invalid-history',
      }),
    )

    expect(loadSidebarPreferences().recentProjectIds).toEqual([])
  })

  it('clears recent projects when preferences are reset', () => {
    const state = recordAccess(initialSidebarState, 'project-1')

    const nextState = sidebarReducer(state, {
      type: sidebarActionTypes.RESET_PREFERENCES,
    })

    expect(nextState.recentProjectIds).toEqual([])
  })
  it('preserves visits recorded after a pruning snapshot was captured', () => {
    const state = recordAccess(
      recordAccess(initialSidebarState, 'deleted'),
      'new-project',
    )
    const nextState = sidebarReducer(state, {
      type: sidebarActionTypes.PRUNE_RECENT_PROJECTS,
      payload: { existingProjectIds: [], observedProjectIds: ['deleted'] },
    })
    expect(nextState.recentProjectIds).toEqual(['new-project'])
  })
})
