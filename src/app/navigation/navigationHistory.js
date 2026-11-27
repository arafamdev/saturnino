export const NAVIGATION_STORAGE_KEY = 'saturnino:navigation-history:v1'
const MAX_ENTRIES = 100
const validationOrigin = 'https://navigation.invalid'

function validEntry(entry) {
  if (
    !entry ||
    typeof entry.key !== 'string' ||
    !entry.key ||
    entry.key.length > 100 ||
    !Number.isSafeInteger(entry.index) ||
    entry.index < 0 ||
    typeof entry.url !== 'string' ||
    entry.url.length > 8192 ||
    !entry.url.startsWith('/') ||
    entry.url.startsWith('//') ||
    entry.url.includes('\\') ||
    [...entry.url].some((character) => character.charCodeAt(0) < 32)
  )
    return false
  try {
    return new URL(entry.url, validationOrigin).origin === validationOrigin
  } catch {
    return false
  }
}

export function navigationEntry(location) {
  let index = null
  try {
    const state = window.history.state
    const candidate = state?.idx
    const browserUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const routerUrl = `${location.pathname}${location.search}${location.hash}`
    if (
      Number.isSafeInteger(candidate) &&
      candidate >= 0 &&
      (state?.key ?? 'default') === location.key &&
      browserUrl === routerUrl
    )
      index = candidate
  } catch {
    /* Unknown history cannot justify a backward delta. */
  }
  return {
    key: location.key,
    index,
    url: `${location.pathname}${location.search}${location.hash}`,
  }
}

function matches(left, right) {
  return (
    left?.key === right.key &&
    left.index === right.index &&
    left.url === right.url
  )
}

function initialJournal(entry) {
  return { entries: [entry], cursor: 0 }
}

export function restoreNavigationJournal(entry, storage) {
  try {
    const saved = JSON.parse(
      (storage ?? window.sessionStorage).getItem(NAVIGATION_STORAGE_KEY),
    )
    if (
      saved?.version !== 1 ||
      !Array.isArray(saved.entries) ||
      !saved.entries.length ||
      saved.entries.length > MAX_ENTRIES ||
      !saved.entries.every(validEntry) ||
      new Set(saved.entries.map((item) => item.key)).size !==
        saved.entries.length ||
      !saved.entries.every(
        (item, i) => i === 0 || item.index === saved.entries[i - 1].index + 1,
      )
    )
      return initialJournal(entry)
    const cursor = saved.entries.findIndex((item) => matches(item, entry))
    if (cursor >= 0) return { entries: saved.entries, cursor }
  } catch {
    /* Reload still works when storage is unavailable or invalid. */
  }
  return initialJournal(entry)
}

export function recordNavigation(journal, entry, action) {
  const current = journal.entries[journal.cursor]
  // A blocked POP can briefly move browser history before Router restores it.
  if (
    entry.index === null &&
    current.key === entry.key &&
    current.url === entry.url
  )
    return journal
  if (matches(current, entry)) return journal
  if (!validEntry(entry) || !validEntry(current)) return initialJournal(entry)
  if (action === 'POP') {
    const cursor = journal.entries.findIndex((item) => matches(item, entry))
    return cursor >= 0 ? { ...journal, cursor } : initialJournal(entry)
  }
  if (action === 'REPLACE' && entry.index === current.index) {
    const entries = [...journal.entries]
    entries[journal.cursor] = entry
    return { entries, cursor: journal.cursor }
  }
  if (action === 'PUSH' && entry.index === current.index + 1) {
    const entries = [
      ...journal.entries.slice(0, journal.cursor + 1),
      entry,
    ].slice(-MAX_ENTRIES)
    return { entries, cursor: entries.length - 1 }
  }
  // A gap means another entry was not observed; never guess what preceded it.
  return initialJournal(entry)
}

export function saveNavigationJournal(journal, storage) {
  try {
    const target = storage ?? window.sessionStorage
    target.setItem(
      NAVIGATION_STORAGE_KEY,
      JSON.stringify({ version: 1, entries: journal.entries }),
    )
  } catch {
    /* In-memory navigation remains available without persistence. */
  }
}

export function canGoBackInternally(journal, entry) {
  const previous = journal.entries[journal.cursor - 1]
  return Boolean(
    validEntry(entry) &&
    matches(journal.entries[journal.cursor], entry) &&
    validEntry(previous) &&
    previous.index === entry.index - 1 &&
    /^\/app(?:\/|$)/.test(new URL(previous.url, validationOrigin).pathname),
  )
}
