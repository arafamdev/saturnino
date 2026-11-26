import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { database } from '@/lib/db/database'

import i18n from '@/i18n'

import { projectRepository } from '../services/projectRepository'

function renderProjectRoute(initialPath = '/app/projects') {
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

describe('Project read errors', () => {
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

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays a read error instead of an empty state', async () => {
    vi.spyOn(projectRepository, 'getProjects').mockRejectedValue(
      new Error('DATABASE_READ_FAILED'),
    )

    renderProjectRoute()

    const errorState = await within(await screen.findByRole('main')).findByRole(
      'alert',
    )

    expect(
      within(errorState).getByRole('heading', {
        name: 'Unable to load projects',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Every great idea starts somewhere.',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'New project',
      }),
    ).toBeDisabled()
  })

  it('recovers the project list after retrying a failed read', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const readProjectsSpy = vi
      .spyOn(projectRepository, 'getProjects')
      .mockRejectedValue(new Error('DATABASE_READ_FAILED'))

    renderProjectRoute()

    const errorState = await within(await screen.findByRole('main')).findByRole(
      'alert',
    )

    readProjectsSpy.mockRestore()

    await user.click(
      within(errorState).getByRole('button', {
        name: 'Try again',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: project.name,
        level: 2,
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Unable to load projects',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'New project',
      }),
    ).toBeEnabled()
  })

  it('distinguishes a project read error from a missing project', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    vi.spyOn(projectRepository, 'getProjectById').mockRejectedValue(
      new Error('DATABASE_READ_FAILED'),
    )

    renderProjectRoute(`/app/projects/${project.id}`)

    expect(
      await screen.findByRole('heading', {
        name: 'Unable to load projects',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Project not found',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Back to projects',
      }),
    ).toHaveAttribute('href', '/app/projects')
  })

  it('recovers project details after retrying a failed read', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
      description: 'Personal productivity application',
    })

    const readProjectSpy = vi
      .spyOn(projectRepository, 'getProjectById')
      .mockRejectedValue(new Error('DATABASE_READ_FAILED'))

    renderProjectRoute(`/app/projects/${project.id}`)

    const errorState = await within(await screen.findByRole('main')).findByRole(
      'alert',
    )

    readProjectSpy.mockRestore()

    await user.click(
      within(errorState).getByRole('button', {
        name: 'Try again',
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

  it('renders the read error in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    vi.spyOn(projectRepository, 'getProjects').mockRejectedValue(
      new Error('DATABASE_READ_FAILED'),
    )

    renderProjectRoute()

    const errorState = await within(await screen.findByRole('main')).findByRole(
      'alert',
    )

    expect(
      within(errorState).getByRole('heading', {
        name: 'Não foi possível carregar os projetos',
      }),
    ).toBeInTheDocument()

    expect(
      within(errorState).getByRole('button', {
        name: 'Tentar novamente',
      }),
    ).toBeInTheDocument()
  })

  it('displays the correct project when navigating between projects', async () => {
    const firstProject = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const secondProject = await projectRepository.createProject({
      name: 'Atmos',
    })

    const router = renderProjectRoute(`/app/projects/${firstProject.id}`)

    expect(
      await screen.findByRole('heading', {
        name: firstProject.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      await router.navigate(`/app/projects/${secondProject.id}`)
    })

    expect(
      await screen.findByRole('heading', {
        name: secondProject.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: firstProject.name,
        level: 1,
      }),
    ).not.toBeInTheDocument()
  })
})
