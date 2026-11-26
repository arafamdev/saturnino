import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { database } from '@/lib/db/database'

import i18n from '@/i18n'

import { projectRepository } from '../services/projectRepository'

function renderProjectRoute(initialPath = '/app') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  })

  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )

  return router
}

async function findExplorerContent() {
  const sidebar = await screen.findByRole('complementary')

  const trigger = within(sidebar).getByRole('button', {
    name: 'Project Explorer',
  })

  const content = document.getElementById(trigger.getAttribute('aria-controls'))

  expect(content).toBeInTheDocument()

  return content
}

async function findExplorerNavigation() {
  const content = await findExplorerContent()

  return within(content).findByRole('navigation', {
    name: 'Project Explorer',
  })
}

async function openProjectActions(user, projectName) {
  const navigation = await findExplorerNavigation()

  await user.click(
    within(navigation).getByRole('button', {
      name: `Actions for ${projectName}`,
    }),
  )
}

describe('Project Explorer integration', () => {
  beforeEach(async () => {
    localStorage.clear()

    await i18n.changeLanguage('en')

    await database.transaction(
      'rw',
      database.projects,
      database.tasks,
      async () => {
        await database.tasks.clear()
        await database.projects.clear()
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays the empty project explorer', async () => {
    renderProjectRoute()

    const content = await findExplorerContent()

    expect(
      await within(content).findByText('No projects yet.'),
    ).toBeInTheDocument()
  })

  it('displays all projects in alphabetical order', async () => {
    for (const name of ['Saturnino', 'Atmos', 'DoNext']) {
      await projectRepository.createProject({ name })
    }

    renderProjectRoute()

    const navigation = await findExplorerNavigation()

    expect(
      within(navigation)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Atmos', 'DoNext', 'Saturnino'])
  })

  it('uses natural numeric ordering', async () => {
    for (const name of ['Project 10', 'Project 2', 'Project 1']) {
      await projectRepository.createProject({ name })
    }

    renderProjectRoute()

    const navigation = await findExplorerNavigation()

    expect(
      within(navigation)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Project 1', 'Project 2', 'Project 10'])
  })

  it('filters projects without case sensitivity', async () => {
    const user = userEvent.setup()

    await projectRepository.createProject({ name: 'Saturnino' })
    await projectRepository.createProject({ name: 'Atmos' })

    renderProjectRoute()

    const navigation = await findExplorerNavigation()
    const content = await findExplorerContent()

    await user.type(within(content).getByRole('searchbox'), 'SATURN')

    expect(
      within(navigation).getByRole('link', {
        name: 'Saturnino',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).queryByRole('link', {
        name: 'Atmos',
      }),
    ).not.toBeInTheDocument()
  })

  it('displays an empty search result and restores the list', async () => {
    const user = userEvent.setup()

    await projectRepository.createProject({ name: 'Saturnino' })

    renderProjectRoute()

    await findExplorerNavigation()

    const content = await findExplorerContent()
    const searchInput = within(content).getByRole('searchbox')

    await user.type(searchInput, 'Unknown project')

    expect(
      within(content).getByText('No matching projects.'),
    ).toBeInTheDocument()

    await user.clear(searchInput)

    expect(
      await within(content).findByRole('link', {
        name: 'Saturnino',
      }),
    ).toBeInTheDocument()
  })

  it('navigates to a project and highlights the active link', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute()

    const navigation = await findExplorerNavigation()

    await user.click(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    )

    const main = await screen.findByRole('main')

    expect(
      await within(main).findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('creates a project directly from the explorer', async () => {
    const user = userEvent.setup()

    renderProjectRoute()

    const content = await findExplorerContent()

    await within(content).findByText('No projects yet.')

    await user.click(
      within(content).getByRole('button', {
        name: 'New project',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    await user.type(
      within(dialog).getByRole('textbox', {
        name: 'Project name',
      }),
      'Saturnino',
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Create project',
      }),
    )

    const navigation = await findExplorerNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: 'Saturnino',
      }),
    ).toBeInTheDocument()

    expect(await projectRepository.getProjects()).toHaveLength(1)
  })

  it('edits a project using the shared project dialog', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute()

    await openProjectActions(user, project.name)

    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Edit project',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    const nameInput = within(dialog).getByRole('textbox', {
      name: 'Project name',
    })

    await user.clear(nameInput)
    await user.type(nameInput, 'Saturnino V2')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Save changes',
      }),
    )

    const navigation = await findExplorerNavigation()

    expect(
      await within(navigation).findByRole('link', {
        name: 'Saturnino V2',
      }),
    ).toBeInTheDocument()
  })

  it('deletes a project after confirmation', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute()

    await openProjectActions(user, project.name)

    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Delete project',
      }),
    )

    const dialog = await screen.findByRole('alertdialog')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete project',
      }),
    )

    const content = await findExplorerContent()

    expect(
      await within(content).findByText('No projects yet.'),
    ).toBeInTheDocument()

    expect(await projectRepository.getProjects()).toHaveLength(0)
    await waitFor(() =>
      expect(
        within(content).getByRole('button', { name: 'New project' }),
      ).toHaveFocus(),
    )
  })

  it('does not navigate when opening project actions', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const router = renderProjectRoute()

    await openProjectActions(user, project.name)

    expect(router.state.location.pathname).toBe('/app')

    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  it('reacts to projects created outside the explorer', async () => {
    renderProjectRoute()

    const content = await findExplorerContent()

    await within(content).findByText('No projects yet.')

    await act(async () => {
      await projectRepository.createProject({
        name: 'Atmos',
      })
    })

    expect(
      await within(content).findByRole('link', {
        name: 'Atmos',
      }),
    ).toBeInTheDocument()
  })

  it('recovers after a failed project list read', async () => {
    const user = userEvent.setup()

    await projectRepository.createProject({ name: 'Saturnino' })

    const readProjectsSpy = vi
      .spyOn(projectRepository, 'getProjects')
      .mockRejectedValue(new Error('DATABASE_READ_FAILED'))

    renderProjectRoute()

    const content = await findExplorerContent()

    expect(
      await within(content).findByText('Unable to load project explorer.'),
    ).toBeInTheDocument()

    readProjectsSpy.mockRestore()

    await user.click(
      within(content).getByRole('button', {
        name: 'Try again',
      }),
    )

    expect(
      await within(content).findByRole('link', {
        name: 'Saturnino',
      }),
    ).toBeInTheDocument()
  })

  it('restores focus after cancelling project creation', async () => {
    const user = userEvent.setup()

    renderProjectRoute()

    const content = await findExplorerContent()

    await within(content).findByText('No projects yet.')

    const createButton = within(content).getByRole('button', {
      name: 'New project',
    })

    await user.click(createButton)

    const dialog = await screen.findByRole('dialog')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    await waitFor(() => {
      expect(createButton).toHaveFocus()
    })
  })

  it('closes the mobile menu after navigating to a project', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute()

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    const navigation = await within(dialog).findByRole('navigation', {
      name: 'Project Explorer',
    })

    await user.click(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    )

    const main = await screen.findByRole('main')

    expect(
      await within(main).findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('keeps the mobile drawer open and restores focus after a nested create dialog', async () => {
    const user = userEvent.setup()
    renderProjectRoute()
    await user.click(
      await screen.findByRole('button', { name: 'Open navigation menu' }),
    )
    const drawer = await screen.findByRole('dialog', {
      name: 'Main navigation',
    })
    const createButton = await within(drawer).findByRole('button', {
      name: 'New project',
    })
    await waitFor(() => expect(createButton).toBeEnabled())
    await user.click(createButton)
    const editor = await screen.findByRole('dialog', { name: 'Create project' })
    await user.click(within(editor).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(createButton).toHaveFocus())
    expect(drawer).toBeInTheDocument()
  })
  it.each(['cancel', 'save'])(
    'restores focus to the actions trigger after project editing: %s',
    async (action) => {
      const user = userEvent.setup()
      const project = await projectRepository.createProject({
        name: 'Focus project',
      })
      renderProjectRoute()
      const navigation = await findExplorerNavigation()
      const trigger = within(navigation).getByRole('button', {
        name: 'Actions for Focus project',
      })
      await user.click(trigger)
      await user.click(
        await screen.findByRole('menuitem', { name: 'Edit project' }),
      )
      const dialog = await screen.findByRole('dialog', { name: 'Edit project' })
      if (action === 'save') {
        const input = within(dialog).getByRole('textbox', {
          name: 'Project name',
        })
        await user.clear(input)
        await user.type(input, 'Updated focus project')
      }
      await user.click(
        within(dialog).getByRole('button', {
          name: action === 'save' ? 'Save changes' : 'Cancel',
        }),
      )
      await waitFor(() => expect(trigger).toHaveFocus())
      expect((await projectRepository.getProjectById(project.id)).name).toBe(
        action === 'save' ? 'Updated focus project' : 'Focus project',
      )
    },
  )
})
