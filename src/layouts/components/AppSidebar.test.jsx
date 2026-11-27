import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import i18n from '@/i18n'

import SidebarProvider from '../context/SidebarProvider'
import { loadSidebarPreferences } from '../services/sidebarStorage'
import {
  initialSidebarState,
  normalizeSidebarWidth,
} from '../state/sidebarReducer'

import AppSidebar from './AppSidebar'
import MobileNavigation from './MobileNavigation'

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <SidebarProvider>
        <AppSidebar />
        <MobileNavigation />
      </SidebarProvider>
    </MemoryRouter>,
  )
}

describe('Resizable and compact sidebar', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    localStorage.clear()
    await i18n.changeLanguage('en')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('resizes with arrow keys, Home and End, respecting limits', async () => {
    const user = userEvent.setup()
    renderSidebar()
    const activeLink = screen
      .getByRole('navigation', { name: 'Main navigation' })
      .querySelector('[aria-current=page]')
    expect(activeLink).toHaveClass('flex', 'min-h-11')
    expect(activeLink.className).not.toContain('=>')
    const separator = screen.getByRole('separator', { name: 'Resize sidebar' })
    separator.focus()
    await user.keyboard('{ArrowRight}')
    expect(separator).toHaveAttribute('aria-valuenow', '272')
    await user.keyboard('{End}{ArrowRight}')
    expect(separator).toHaveAttribute('aria-valuenow', '400')
    await user.keyboard('{Home}{ArrowLeft}')
    expect(separator).toHaveAttribute('aria-valuenow', '224')
    expect(loadSidebarPreferences().width).toBe(224)
  })

  it('previews pointer resizing, persists on release and cancels interrupted drags', () => {
    renderSidebar()
    const separator = screen.getByRole('separator', { name: 'Resize sidebar' })
    separator.setPointerCapture = () => {}
    fireEvent.pointerDown(separator, { button: 0, pointerId: 1, clientX: 256 })
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 320 })
    expect(separator).toHaveAttribute('aria-valuenow', '320')
    expect(loadSidebarPreferences().width).toBe(256)
    fireEvent.pointerUp(separator, { pointerId: 1, clientX: 320 })
    expect(loadSidebarPreferences().width).toBe(320)
    fireEvent.pointerDown(separator, { button: 0, pointerId: 2, clientX: 320 })
    fireEvent.pointerMove(separator, { pointerId: 2, clientX: 380 })
    fireEvent.pointerCancel(separator, { pointerId: 2 })
    expect(separator).toHaveAttribute('aria-valuenow', '320')
    expect(loadSidebarPreferences().width).toBe(320)
  })

  it('persists compact mode, exposes tooltips and keeps mobile sections available', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSidebar()
    await user.click(screen.getByRole('button', { name: 'Compact sidebar' }))
    expect(loadSidebarPreferences().compact).toBe(true)
    expect(
      screen.queryByRole('separator', { name: 'Resize sidebar' }),
    ).not.toBeInTheDocument()
    const navigation = screen.getByRole('navigation', {
      name: 'Main navigation',
    })
    const projectsLink = within(navigation).getByRole('link', {
      name: 'Projects',
    })
    act(() => projectsLink.focus())
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Projects')
    await user.keyboard('{Escape}')
    await user.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    )
    const drawer = screen.getByRole('dialog', { name: 'Main navigation' })
    expect(
      within(drawer).getByRole('button', { name: 'Project Explorer' }),
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Customize sidebar' }),
    ).toBeInTheDocument()
    unmount()
    renderSidebar()
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(
      screen.getByRole('separator', { name: 'Resize sidebar' }),
    ).toHaveAttribute('aria-valuenow', '256')
  })

  it('normalizes corrupted dimensions and restores old preferences', () => {
    for (const value of [null, undefined, NaN, Infinity, '300', {}])
      expect(normalizeSidebarWidth(value)).toBe(256)
    expect(normalizeSidebarWidth(-100)).toBe(224)
    expect(normalizeSidebarWidth(900)).toBe(400)
    localStorage.setItem(
      'saturnino:sidebar-preferences',
      JSON.stringify({ width: 'bad', compact: 'true' }),
    )
    expect(loadSidebarPreferences().width).toBe(256)
    expect(loadSidebarPreferences().compact).toBe(false)
  })

  it('resets width and compact mode with all other preferences', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      'saturnino:sidebar-preferences',
      JSON.stringify({ width: 380, compact: true }),
    )
    renderSidebar()
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    await user.click(screen.getByRole('button', { name: 'Customize sidebar' }))
    await user.click(
      screen.getByRole('button', { name: 'Reset sidebar preferences' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(loadSidebarPreferences()).toEqual(initialSidebarState),
    )
    expect(
      screen.getByRole('separator', { name: 'Resize sidebar' }),
    ).toHaveAttribute('aria-valuenow', '256')
  })
  it('keeps the original resize pointer when another pointer touches the handle', () => {
    renderSidebar()
    const separator = screen.getByRole('separator', { name: 'Resize sidebar' })
    separator.setPointerCapture = () => {}
    fireEvent.pointerDown(separator, { button: 0, pointerId: 1, clientX: 256 })
    fireEvent.pointerDown(separator, { button: 0, pointerId: 2, clientX: 100 })
    fireEvent.pointerMove(separator, { pointerId: 2, clientX: 400 })
    fireEvent.pointerCancel(separator, { pointerId: 2 })
    expect(separator).toHaveAttribute('aria-valuenow', '256')
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 300 })
    fireEvent.pointerUp(separator, { pointerId: 1, clientX: 300 })
    expect(loadSidebarPreferences().width).toBe(300)
  })
})
