import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock browser scrolling APIs unavailable in jsdom.
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Remove rendered components and clear mocks after each test.
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
