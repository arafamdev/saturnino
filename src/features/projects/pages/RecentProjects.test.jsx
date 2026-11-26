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

  const renderedApp = render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )

  return {
    ...renderedApp,
    router,
  }
}

async function visitProject(router, project) {
  await act(async () => {
    await router.navigate(`/app/projects/${project.id}`)
  })

  const main = await screen.findByRole('main')

  await within(main).findByRole('heading', {
    name: project.name,
    level: 1,
  })

  await waitFor(() => {
    expect(getStoredRecentProjectIds()[0]).toBe(project.id)
  })
}

async function findRecentNavigation() {
  const sidebar = await screen.findByRole('complementary')

  return within(sidebar).findByRole('navigation', {
    name: 'Recent Projects',
  })
}

function getStoredRecentProjectIds() {
  const preferences = JSON.parse(
    localStorage.getItem('saturnino:sidebar-preferences') ?? '{}',
  )

  return preferences.recentProjectIds ?? []
}

describe('Recent projects integration', () => {
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

  it('displays the empty recent projects state', async () => {
    renderProjectRoute()

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('No recently visited projects.'),
    ).toBeInTheDocument()
  })

  it('records a project opened through its direct URL', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute(`/app/projects/${project.id}`)

    const navigation = await findRecentNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toHaveAttribute('aria-current', 'page')

    await waitFor(() => {
      expect(getStoredRecentProjectIds()).toEqual([project.id])
    })
  })

  it('orders projects by their latest access', async () => {
    const firstProject = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const secondProject = await projectRepository.createProject({
      name: 'Atmos',
    })

    const { router } = renderProjectRoute()

    await visitProject(router, firstProject)
    await visitProject(router, secondProject)

    const navigation = await findRecentNavigation()

    await waitFor(() => {
      expect(
        within(navigation)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(['Atmos', 'Saturnino'])
    })
  })

  it('moves a revisited project to the beginning', async () => {
    const firstProject = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const secondProject = await projectRepository.createProject({
      name: 'Atmos',
    })

    const { router } = renderProjectRoute()

    await visitProject(router, firstProject)
    await visitProject(router, secondProject)
    await visitProject(router, firstProject)

    expect(getStoredRecentProjectIds()).toEqual([
      firstProject.id,
      secondProject.id,
    ])
  })

  it('restores recent projects after remounting the application', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const { router, unmount } = renderProjectRoute()

    await visitProject(router, project)

    unmount()

    renderProjectRoute()

    const navigation = await findRecentNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toBeInTheDocument()
  })

  it('does not record a missing project', async () => {
    renderProjectRoute('/app/projects/missing-project')

    expect(
      await screen.findByRole('heading', {
        name: 'Project not found',
      }),
    ).toBeInTheDocument()

    expect(getStoredRecentProjectIds()).toEqual([])
  })

  it('does not record a project when its read fails', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    vi.spyOn(projectRepository, 'getProjectById').mockRejectedValue(
      new Error('DATABASE_READ_FAILED'),
    )

    renderProjectRoute(`/app/projects/${project.id}`)

    const main = await screen.findByRole('main')

    expect(
      await within(main).findByRole('heading', {
        name: 'Unable to load projects',
      }),
    ).toBeInTheDocument()

    expect(getStoredRecentProjectIds()).toEqual([])
  })

  it('removes deleted projects from the recent history', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const { router } = renderProjectRoute()

    await visitProject(router, project)

    await act(async () => {
      await router.navigate('/app')
      await projectRepository.deleteProject(project.id)
    })

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('No recently visited projects.'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(getStoredRecentProjectIds()).toEqual([])
    })
  })

  it('displays updated project names without duplicating history', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const { router } = renderProjectRoute()

    await visitProject(router, project)

    await act(async () => {
      await projectRepository.updateProject(project.id, {
        name: 'Saturnino V2',
      })
    })

    const navigation = await findRecentNavigation()

    expect(
      await within(navigation).findByRole('link', {
        name: 'Saturnino V2',
      }),
    ).toBeInTheDocument()

    expect(getStoredRecentProjectIds()).toEqual([project.id])
  })

  it('preserves recent history when the project list read fails', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const { router, unmount } = renderProjectRoute()

    await visitProject(router, project)

    unmount()

    vi.spyOn(projectRepository, 'getProjects').mockRejectedValue(
      new Error('DATABASE_READ_FAILED'),
    )

    renderProjectRoute()

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('Unable to load recent projects.'),
    ).toBeInTheDocument()

    expect(getStoredRecentProjectIds()).toEqual([project.id])
  })

  it('closes the mobile menu after selecting a recent project', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const { router } = renderProjectRoute()

    await visitProject(router, project)

    await act(async () => {
      await router.navigate('/app')
    })

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    const navigation = await within(dialog).findByRole('navigation', {
      name: 'Recent Projects',
    })

    await user.click(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it.each([false, true])(
    'prunes deleted projects when Recent Projects is hidden (compact: %s)',
    async (compact) => {
      const project = await projectRepository.createProject({
        name: 'Hidden history project',
      })
      localStorage.setItem(
        'saturnino:sidebar-preferences',
        JSON.stringify({
          hiddenSections: ['recentProjects'],
          compact,
          recentProjectIds: [project.id],
        }),
      )
      renderProjectRoute()
      await waitFor(() =>
        expect(getStoredRecentProjectIds()).toEqual([project.id]),
      )
      await act(async () => {
        await projectRepository.deleteProject(project.id)
      })
      await waitFor(() => expect(getStoredRecentProjectIds()).toEqual([]))
    },
  )
})
