import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import i18n from '@/i18n'

import SidebarProvider from '../context/SidebarProvider'
import { loadSidebarPreferences } from '../services/sidebarStorage'
import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
} from '../state/sidebarReducer'

import SidebarCustomization from './SidebarCustomization'

async function renderCustomization() {
  const user = userEvent.setup()
  render(
    <SidebarProvider>
      <SidebarCustomization />
    </SidebarProvider>,
  )
  await user.click(screen.getByRole('button', { name: 'Customize sidebar' }))
  return user
}

function sectionNames() {
  return within(screen.getByRole('list', { name: 'Sidebar sections' }))
    .getAllByRole('checkbox')
    .map((input) => input.parentElement.textContent)
}

describe('Sidebar customization', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('en')
  })

  it('hides optional sections persistently and protects essential navigation', async () => {
    const user = await renderCustomization()
    expect(screen.getByRole('checkbox', { name: 'Workspace' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: 'Favorites' }))
    expect(loadSidebarPreferences().hiddenSections).toEqual(['favorites'])
    const state = sidebarReducer(initialSidebarState, {
      type: sidebarActionTypes.SET_VISIBILITY,
      payload: { sectionId: 'workspace', visible: false },
    })
    expect(state).toBe(initialSidebarState)
  })

  it('reorders with buttons, keeps focus and announces the new position', async () => {
    const user = await renderCustomization()
    const button = screen.getByRole('button', { name: 'Move Favorites down' })
    await user.click(button)
    expect(sectionNames()).toEqual([
      'Workspace',
      'Recent Projects',
      'Favorites',
      'Project Explorer',
    ])
    expect(button).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Favorites moved to position 3.',
    )
    expect(loadSidebarPreferences().sectionOrder[2]).toBe('favorites')
  })

  it('supports arrow keys on handles and ignores boundaries', async () => {
    const user = await renderCustomization()
    const handle = screen.getByRole('button', { name: 'Reorder Workspace' })
    handle.focus()
    await user.keyboard('{ArrowUp}{ArrowDown}')
    expect(sectionNames()[1]).toBe('Workspace')
    expect(handle).toHaveFocus()
  })

  it('supports pointer drop and pointer cancellation', async () => {
    await renderCustomization()
    const handle = screen.getByRole('button', { name: 'Reorder Favorites' })
    handle.setPointerCapture = () => {}
    const rows = screen.getAllByRole('listitem')
    rows[3].getBoundingClientRect = () => ({
      top: 100,
      bottom: 150,
      left: 0,
      right: 200,
    })
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 })
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 125 })
    expect(loadSidebarPreferences().sectionOrder[3]).toBe('favorites')
    fireEvent.pointerDown(handle, { button: 0, pointerId: 2 })
    fireEvent.pointerCancel(handle, { pointerId: 2 })
    fireEvent.pointerUp(handle, { pointerId: 2, clientX: 100, clientY: 125 })
    expect(loadSidebarPreferences().sectionOrder[3]).toBe('favorites')
  })

  it('normalizes old, duplicate and corrupted preferences', () => {
    localStorage.setItem(
      'saturnino:sidebar-preferences',
      JSON.stringify({
        sectionOrder: ['favorites', 'bogus', 'favorites'],
        hiddenSections: ['workspace', 'favorites', 'favorites', null],
      }),
    )
    expect(loadSidebarPreferences().sectionOrder).toEqual([
      'favorites',
      'workspace',
      'recentProjects',
      'projectExplorer',
    ])
    expect(loadSidebarPreferences().hiddenSections).toEqual(['favorites'])
  })

  it('resets visibility and section order', async () => {
    const user = await renderCustomization()
    await user.click(screen.getByRole('checkbox', { name: 'Favorites' }))
    await user.click(
      screen.getByRole('button', { name: 'Move Favorites down' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Reset sidebar preferences' }),
    )
    expect(loadSidebarPreferences()).toEqual(initialSidebarState)
  })
  it('ignores secondary pointers and cancellation from another pointer', async () => {
    await renderCustomization()
    const handle = screen.getByRole('button', { name: 'Reorder Favorites' })
    const otherHandle = screen.getByRole('button', {
      name: 'Reorder Workspace',
    })
    handle.setPointerCapture = () => {}
    otherHandle.setPointerCapture = () => {}
    screen.getAllByRole('listitem')[3].getBoundingClientRect = () => ({
      left: 0,
      right: 200,
      top: 100,
      bottom: 150,
    })
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 })
    fireEvent.pointerDown(otherHandle, { button: 0, pointerId: 2 })
    fireEvent.pointerUp(otherHandle, {
      pointerId: 2,
      clientX: 100,
      clientY: 125,
    })
    fireEvent.pointerCancel(handle, { pointerId: 2 })
    expect(loadSidebarPreferences().sectionOrder[1]).toBe('favorites')
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 125 })
    expect(loadSidebarPreferences().sectionOrder[3]).toBe('favorites')
  })
})
