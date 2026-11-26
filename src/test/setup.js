import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

import i18n from '@/i18n'

// Mock browser scrolling APIs unavailable in jsdom.
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Start each test with the default language.
beforeEach(async () => {
  await i18n.changeLanguage('en')
})

// Remove rendered components and clear mocks after each test.
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
