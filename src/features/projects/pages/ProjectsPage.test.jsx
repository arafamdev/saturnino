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

async function openCreateDialog(user) {
  await user.click(
    await screen.findByRole('button', {
      name: 'New project',
    }),
  )

  return screen.findByRole('dialog', {
    name: 'Create project',
  })
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

describe('Project management', () => {
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

  it('renders the empty state when no projects exist', async () => {
    renderProjectsPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Every great idea starts somewhere.',
      }),
    ).toBeInTheDocument()
  })

  it('renders existing projects from the database', async () => {
    await projectRepository.createProject({
      name: 'Saturnino',
      description: 'Personal productivity application',
    })

    renderProjectsPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Saturnino',
        level: 2,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Personal productivity application'),
    ).toBeInTheDocument()
  })

  it('creates a project and updates the list reactively', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const dialog = await openCreateDialog(user)

    await user.type(
      within(dialog).getByRole('textbox', {
        name: 'Project name',
      }),
      'Portfolio Website',
    )

    await user.type(
      within(dialog).getByRole('textbox', {
        name: 'Description',
      }),
      'Frontend developer portfolio',
    )

    await user.click(
      within(dialog).getByRole('radio', {
        name: 'Green',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Create project',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Portfolio Website',
        level: 2,
      }),
    ).toBeInTheDocument()

    const projects = await projectRepository.getProjects()

    expect(projects).toHaveLength(1)

    expect(projects[0]).toMatchObject({
      name: 'Portfolio Website',
      description: 'Frontend developer portfolio',
      color: '#34D399',
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('rejects a project with an empty name', async () => {
    const user = userEvent.setup()

    renderProjectsPage()

    const dialog = await openCreateDialog(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Create project',
      }),
    )

    expect(
      await within(dialog).findByText('Enter a project name.'),
    ).toBeInTheDocument()

    expect(await projectRepository.getProjects()).toHaveLength(0)
  })

  it('edits an existing project', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Old project name',
      description: 'Old description',
    })

    renderProjectsPage()

    await openProjectAction(user, project.name, 'Edit project')

    const dialog = await screen.findByRole('dialog', {
      name: 'Edit project',
    })

    const nameInput = within(dialog).getByRole('textbox', {
      name: 'Project name',
    })

    const descriptionInput = within(dialog).getByRole('textbox', {
      name: 'Description',
    })

    expect(nameInput).toHaveValue(project.name)
    expect(descriptionInput).toHaveValue(project.description)

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated project')

    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    await user.click(
      within(dialog).getByRole('radio', {
        name: 'Blue',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Updated project',
        level: 2,
      }),
    ).toBeInTheDocument()

    const updatedProject = await projectRepository.getProjectById(project.id)

    expect(updatedProject).toMatchObject({
      id: project.id,
      name: 'Updated project',
      description: 'Updated description',
      color: '#60A5FA',
      createdAt: project.createdAt,
    })
  })

  it('preserves the project when deletion is cancelled', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectsPage()

    await openProjectAction(user, project.name, 'Delete project')

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete project?',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    expect(await projectRepository.getProjectById(project.id)).toEqual(project)
  })

  it('deletes a project and its related tasks after confirmation', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const timestamp = new Date().toISOString()

    await database.tasks.add({
      id: crypto.randomUUID(),
      projectId: project.id,
      title: 'Build project management',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      position: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
    })

    renderProjectsPage()

    await openProjectAction(user, project.name, 'Delete project')

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete project?',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete project',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Every great idea starts somewhere.',
      }),
    ).toBeInTheDocument()

    expect(await projectRepository.getProjectById(project.id)).toBeUndefined()

    expect(
      await database.tasks.where('projectId').equals(project.id).count(),
    ).toBe(0)
  })

  it('navigates to the selected project details', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
      description: 'Personal productivity application',
    })

    renderProjectsPage()

    await user.click(
      await screen.findByRole('link', {
        name: `View project ${project.name}`,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(project.description)).toBeInTheDocument()
  })
})
