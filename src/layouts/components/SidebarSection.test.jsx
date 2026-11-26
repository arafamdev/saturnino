import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SidebarProvider from '../context/SidebarProvider'
import { sidebarSectionIds } from '../state/sidebarReducer'
import { loadSidebarPreferences } from '../services/sidebarStorage'

import SidebarSection from './SidebarSection'

const STORAGE_KEY = 'saturnino:sidebar-preferences'

function renderSidebarSections() {
  return render(
    <SidebarProvider>
      <SidebarSection sectionId={sidebarSectionIds.WORKSPACE} title="Workspace">
        <a href="/app">Overview</a>
      </SidebarSection>

      <SidebarSection sectionId={sidebarSectionIds.FAVORITES} title="Favorites">
        <a href="/app/projects/example">Example project</a>
      </SidebarSection>
    </SidebarProvider>,
  )
}

describe('SidebarSection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the section title and content by default', () => {
    renderSidebarSections()

    expect(screen.getByRole('button', { name: 'Workspace' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible()
  })

  it('collapses an expanded section when its trigger is clicked', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    const workspaceTrigger = screen.getByRole('button', {
      name: 'Workspace',
    })

    await user.click(workspaceTrigger)

    expect(workspaceTrigger).toHaveAttribute('aria-expanded', 'false')

    expect(
      screen.queryByRole('link', { name: 'Overview' }),
    ).not.toBeInTheDocument()
  })

  it('expands a collapsed section when its trigger is clicked', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    const workspaceTrigger = screen.getByRole('button', {
      name: 'Workspace',
    })

    await user.click(workspaceTrigger)
    await user.click(workspaceTrigger)

    expect(workspaceTrigger).toHaveAttribute('aria-expanded', 'true')

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible()
  })

  it('preserves the expanded state of other sections', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    await user.click(screen.getByRole('button', { name: 'Workspace' }))

    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    expect(screen.getByRole('link', { name: 'Example project' })).toBeVisible()
  })

  it('restores a previously collapsed section', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expandedSections: {
          workspace: false,
        },
      }),
    )

    renderSidebarSections()

    expect(screen.getByRole('button', { name: 'Workspace' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    expect(
      screen.queryByRole('link', { name: 'Overview' }),
    ).not.toBeInTheDocument()
  })

  it('persists changes to the expanded state', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    await user.click(screen.getByRole('button', { name: 'Workspace' }))

    expect(loadSidebarPreferences().expandedSections.workspace).toBe(false)
  })

  it('supports toggling a section with the Enter key', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    const workspaceTrigger = screen.getByRole('button', {
      name: 'Workspace',
    })

    await user.tab()

    expect(workspaceTrigger).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(workspaceTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports toggling a section with the Space key', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    const workspaceTrigger = screen.getByRole('button', {
      name: 'Workspace',
    })

    await user.tab()
    await user.keyboard(' ')

    expect(workspaceTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('associates the expanded trigger with its content', () => {
    renderSidebarSections()

    const workspaceTrigger = screen.getByRole('button', {
      name: 'Workspace',
    })

    const contentId = workspaceTrigger.getAttribute('aria-controls')

    expect(contentId).toBeTruthy()

    const sectionContent = document.getElementById(contentId)

    expect(sectionContent).toBeInTheDocument()

    expect(sectionContent).toContainElement(
      screen.getByRole('link', { name: 'Overview' }),
    )
  })

  it('skips collapsed content during keyboard navigation', async () => {
    const user = userEvent.setup()

    renderSidebarSections()

    await user.tab()
    await user.keyboard('{Enter}')
    await user.tab()

    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveFocus()
  })
})
