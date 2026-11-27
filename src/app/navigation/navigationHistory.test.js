import { describe, expect, it } from 'vitest'

import {
  NAVIGATION_STORAGE_KEY,
  canGoBackInternally,
  recordNavigation,
  restoreNavigationJournal,
  saveNavigationJournal,
} from './navigationHistory'

const entry = (index, url = '/app', key = `entry-${index}`) => ({
  index,
  url,
  key,
})
const journal = (current) => ({ entries: [current], cursor: 0 })
const storage = (value) => ({ getItem: () => value })

describe('observed internal navigation history', () => {
  it('follows consecutive entries and POP/Forward without adding history', () => {
    const first = entry(4)
    const second = entry(5, '/app/projects')
    const third = entry(6, '/app/tasks?status=todo#tasks')
    const start = journal(first)
    const pushed = recordNavigation(
      recordNavigation(start, second, 'PUSH'),
      third,
      'PUSH',
    )
    expect(canGoBackInternally(pushed, third)).toBe(true)
    const popped = recordNavigation(pushed, second, 'POP')
    expect(popped.entries).toBe(pushed.entries)
    expect(popped.cursor).toBe(1)
    expect(recordNavigation(popped, third, 'POP').cursor).toBe(2)
    expect(start).toEqual(journal(first))
  })

  it('replaces query state and truncates the old forward branch after a new push', () => {
    const first = entry(0)
    const second = entry(1, '/app/tasks?status=todo')
    const third = entry(2, '/app/settings')
    const replaced = entry(1, '/app/tasks?priority=high', 'replacement')
    const pushed = recordNavigation(
      recordNavigation(journal(first), second, 'PUSH'),
      third,
      'PUSH',
    )
    const back = recordNavigation(pushed, second, 'POP')
    const updated = recordNavigation(back, replaced, 'REPLACE')
    expect(updated.entries).toEqual([first, replaced, third])
    const next = entry(2, '/app/projects', 'new-branch')
    expect(recordNavigation(updated, next, 'PUSH').entries).toEqual([
      first,
      replaced,
      next,
    ])
    expect(canGoBackInternally(updated, replaced)).toBe(true)
  })

  it('never uses a delta after a public route, unknown POP or missing index', () => {
    const publicPage = entry(0, '/about')
    const current = entry(1, '/app/tasks')
    expect(
      canGoBackInternally(
        recordNavigation(journal(publicPage), current, 'PUSH'),
        current,
      ),
    ).toBe(false)
    expect(
      recordNavigation(
        journal(current),
        entry(0, '/app/projects', 'unknown'),
        'POP',
      ).entries,
    ).toHaveLength(1)
    const unknown = entry(null, '/app/tasks')
    expect(canGoBackInternally(journal(unknown), unknown)).toBe(false)
  })

  it('resets on an unobserved gap and requires the exact current entry', () => {
    const first = entry(0)
    const current = entry(2, '/app/tasks')
    const next = recordNavigation(journal(first), current, 'PUSH')
    expect(next.entries).toEqual([current])
    expect(canGoBackInternally(next, current)).toBe(false)
    const observed = recordNavigation(
      journal(first),
      entry(1, '/app/tasks'),
      'PUSH',
    )
    expect(canGoBackInternally(observed, entry(1, '/app/projects'))).toBe(false)
  })

  it('restores reload only when key, URL and index match the saved entry', () => {
    const first = entry(3)
    const current = entry(4, '/app/tasks?due=overdue')
    const saved = JSON.stringify({ version: 1, entries: [first, current] })
    expect(
      canGoBackInternally(
        restoreNavigationJournal(current, storage(saved)),
        current,
      ),
    ).toBe(true)
    for (const mismatch of [
      entry(0, current.url),
      entry(4, '/app/projects'),
      entry(4, current.url, 'fresh'),
    ]) {
      expect(restoreNavigationJournal(mismatch, storage(saved))).toEqual(
        journal(mismatch),
      )
    }
  })

  it('rejects corrupted, noncontiguous, duplicate and external persisted entries', () => {
    const current = entry(1, '/app/tasks')
    for (const entries of [
      [entry(0, 'https://example.com'), current],
      [entry(0, '//example.com/app'), current],
      [entry(0, '/\\example.com'), current],
      [entry(0, '/app\n'), current],
      [entry(0, '/app', current.key), current],
      [entry(5), current],
      [],
    ]) {
      expect(
        restoreNavigationJournal(
          current,
          storage(JSON.stringify({ version: 1, entries })),
        ),
      ).toEqual(journal(current))
    }
    expect(restoreNavigationJournal(current, storage('{broken'))).toEqual(
      journal(current),
    )
  })

  it('bounds retained history and ignores a repeated observation', () => {
    let state = journal(entry(0))
    for (let index = 1; index <= 110; index += 1)
      state = recordNavigation(state, entry(index), 'PUSH')
    expect(state.entries).toHaveLength(100)
    expect(state.cursor).toBe(99)
    expect(state.entries[0].index).toBe(11)
    expect(recordNavigation(state, entry(110), 'POP')).toBe(state)
  })

  it('tolerates blocked storage and writes only the versioned navigation journal', () => {
    const current = entry(0)
    const unavailable = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    expect(restoreNavigationJournal(current, unavailable)).toEqual(
      journal(current),
    )
    expect(() =>
      saveNavigationJournal(journal(current), unavailable),
    ).not.toThrow()
    let written
    saveNavigationJournal(journal(current), {
      setItem(key, value) {
        written = [key, JSON.parse(value)]
      },
    })
    expect(written).toEqual([
      NAVIGATION_STORAGE_KEY,
      { version: 1, entries: [current] },
    ])
  })
})
