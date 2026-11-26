import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { database } from '@/lib/db/database'

import { projectRepository } from '../services/projectRepository'

function renderProjectsPage() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/projects'],
  })

  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
}

async function getNewProjectButton() {
  const newProjectButton = await screen.findByRole('button', {
    name: 'New project',
  })

  await waitFor(() => {
    expect(newProjectButton).toBeEnabled()
  })

  return newProjectButton
}

async function openProjectAction(user, projectName, actionName) {
  await user.click(
    await screen.findByRole('button', {
      name: `Actions for ${projectName}`,
    }),
  )

  await user.click(
    await screen.findByRole('menuitem', {
      name: actionName,
    }),
  )
}

async function expectDialogClosedWithRestoredFocus(dialog, newProjectButton) {
  await waitFor(() => {
    expect(dialog).not.toBeInTheDocument()
    expect(newProjectButton).toHaveFocus()
  })
}

describe('Project focus management', () => {
  beforeEach(async () => {
    localStorage.clear()

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

  it('restores focus after cancelling project creation', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await user.click(newProjectButton)

    const dialog = await screen.findByRole('dialog', {
      name: 'Create project',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)
  })

  it('restores focus after creating a project', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await user.click(newProjectButton)

    const dialog = await screen.findByRole('dialog', {
      name: 'Create project',
    })

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

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)

    expect(
      await screen.findByRole('heading', {
        name: 'Saturnino',
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it('restores focus after cancelling project editing', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await openProjectAction(user, project.name, 'Edit project')

    const dialog = await screen.findByRole('dialog', {
      name: 'Edit project',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)
  })

  it('restores focus after saving project changes', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await openProjectAction(user, project.name, 'Edit project')

    const dialog = await screen.findByRole('dialog', {
      name: 'Edit project',
    })

    const nameInput = within(dialog).getByRole('textbox', {
      name: 'Project name',
    })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Saturnino')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Save changes',
      }),
    )

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)

    expect(
      await screen.findByRole('heading', {
        name: 'Updated Saturnino',
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it('restores focus after cancelling project deletion', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await openProjectAction(user, project.name, 'Delete project')

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete project?',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)

    expect(await projectRepository.getProjectById(project.id)).toEqual(project)
  })

  it('restores focus after deleting a project', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await openProjectAction(user, project.name, 'Delete project')

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete project?',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete project',
      }),
    )

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)

    expect(await projectRepository.getProjectById(project.id)).toBeUndefined()
  })

  it('restores focus when closing the dialog with Escape', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await user.click(newProjectButton)

    const dialog = await screen.findByRole('dialog', {
      name: 'Create project',
    })

    await user.keyboard('{Escape}')

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)
  })

  it('allows keyboard navigation after closing the dialog', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const newProjectButton = await getNewProjectButton()

    await user.click(newProjectButton)

    const dialog = await screen.findByRole('dialog', {
      name: 'Create project',
    })

    await user.keyboard('{Escape}')

    await expectDialogClosedWithRestoredFocus(dialog, newProjectButton)

    await user.tab()

    expect(
      screen.getByRole('button', {
        name: 'Create project',
      }),
    ).toHaveFocus()
  })
})
