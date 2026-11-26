import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSidebar } from '../hooks/useSidebar'
import { sidebarSectionIds } from '../state/sidebarReducer'
import { loadSidebarPreferences } from '../services/sidebarStorage'

import SidebarProvider from './SidebarProvider'

const STORAGE_KEY = 'saturnino:sidebar-preferences'

function SidebarConsumer() {
  const { expandedSections, toggleSection, resetPreferences } = useSidebar()

  const isFavoritesExpanded = expandedSections.favorites

  return (
    <div>
      <button
        type="button"
        aria-expanded={isFavoritesExpanded}
        onClick={() => toggleSection(sidebarSectionIds.FAVORITES)}
      >
        Favorites
      </button>

      <button type="button" onClick={resetPreferences}>
        Reset preferences
      </button>
    </div>
  )
}

function renderSidebarConsumer() {
  return render(
    <SidebarProvider>
      <SidebarConsumer />
    </SidebarProvider>,
  )
}

describe('SidebarProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('uses default preferences when storage is empty', () => {
    renderSidebarConsumer()

    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('restores stored sidebar preferences', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expandedSections: {
          favorites: false,
        },
      }),
    )

    renderSidebarConsumer()

    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('toggles a section and persists the updated preferences', async () => {
    const user = userEvent.setup()

    renderSidebarConsumer()

    const favoritesButton = screen.getByRole('button', {
      name: 'Favorites',
    })

    await user.click(favoritesButton)

    expect(favoritesButton).toHaveAttribute('aria-expanded', 'false')

    expect(loadSidebarPreferences().expandedSections.favorites).toBe(false)
  })

  it('preserves preferences after remounting', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSidebarConsumer()

    await user.click(screen.getByRole('button', { name: 'Favorites' }))

    unmount()

    renderSidebarConsumer()

    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('resets preferences to their default values', async () => {
    const user = userEvent.setup()

    renderSidebarConsumer()

    const favoritesButton = screen.getByRole('button', {
      name: 'Favorites',
    })

    await user.click(favoritesButton)

    await user.click(
      screen.getByRole('button', {
        name: 'Reset preferences',
      }),
    )

    expect(favoritesButton).toHaveAttribute('aria-expanded', 'true')

    expect(loadSidebarPreferences().expandedSections.favorites).toBe(true)
  })

  it('allows section toggling when storage is unavailable', async () => {
    const user = userEvent.setup()

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    renderSidebarConsumer()

    const favoritesButton = screen.getByRole('button', {
      name: 'Favorites',
    })

    await user.click(favoritesButton)

    expect(favoritesButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('throws an error when used outside the provider', () => {
    expect(() => render(<SidebarConsumer />)).toThrow(
      'useSidebar must be used within a SidebarProvider',
    )
  })
})
