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

async function findFavoriteButton(projectName) {
  const main = await screen.findByRole('main')

  return within(main).findByRole('button', {
    name: `Favorite project ${projectName}`,
  })
}

async function findFavoriteNavigation() {
  const sidebar = await screen.findByRole('complementary')

  return within(sidebar).findByRole('navigation', {
    name: 'Favorites',
  })
}

describe('Favorite projects integration', () => {
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

  it('displays the empty favorites state', async () => {
    renderProjectRoute()

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('No favorite projects yet.'),
    ).toBeInTheDocument()
  })

  it('adds a favorite from a project card and updates the sidebar', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    const router = renderProjectRoute()

    const favoriteButton = await findFavoriteButton(project.name)

    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(favoriteButton)

    const navigation = await findFavoriteNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toHaveAttribute('href', `/app/projects/${project.id}`)

    await waitFor(() => {
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    })

    expect(router.state.location.pathname).toBe('/app/projects')

    expect(
      (await projectRepository.getProjectById(project.id)).isFavorite,
    ).toBe(true)
  })

  it('removes a favorite from a project card', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    await projectRepository.toggleProjectFavorite(project.id)

    renderProjectRoute()

    const favoriteButton = await findFavoriteButton(project.name)

    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(favoriteButton)

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('No favorite projects yet.'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    })

    expect(
      (await projectRepository.getProjectById(project.id)).isFavorite,
    ).toBe(false)
  })

  it('updates favorites from the project details page', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    renderProjectRoute(`/app/projects/${project.id}`)

    const favoriteButton = await findFavoriteButton(project.name)

    await user.click(favoriteButton)

    const navigation = await findFavoriteNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toHaveAttribute('aria-current', 'page')

    await waitFor(() => {
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('navigates to project details from the favorites section', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    await projectRepository.toggleProjectFavorite(project.id)

    renderProjectRoute('/app')

    const navigation = await findFavoriteNavigation()

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
  })

  it('removes deleted projects from the sidebar reactively', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    await projectRepository.toggleProjectFavorite(project.id)

    renderProjectRoute()

    const navigation = await findFavoriteNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      await projectRepository.deleteProject(project.id)
    })

    const sidebar = await screen.findByRole('complementary')

    expect(
      await within(sidebar).findByText('No favorite projects yet.'),
    ).toBeInTheDocument()
  })

  it('closes the mobile menu after selecting a favorite', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    await projectRepository.toggleProjectFavorite(project.id)

    renderProjectRoute('/app')

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    const navigation = await within(dialog).findByRole('navigation', {
      name: 'Favorites',
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

  it('displays a write error without changing the favorite state', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    vi.spyOn(projectRepository, 'toggleProjectFavorite').mockRejectedValueOnce(
      new Error('DATABASE_WRITE_FAILED'),
    )

    renderProjectRoute()

    const favoriteButton = await findFavoriteButton(project.name)

    await user.click(favoriteButton)

    const main = screen.getByRole('main')

    expect(await within(main).findByRole('alert')).toHaveTextContent(
      'Unable to update favorite. Please try again.',
    )

    await waitFor(() => {
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    })

    expect(
      (await projectRepository.getProjectById(project.id)).isFavorite,
    ).toBe(false)

    expect(favoriteButton).toBeEnabled()
  })

  it('recovers after retrying a failed favorite update', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    vi.spyOn(projectRepository, 'toggleProjectFavorite').mockRejectedValueOnce(
      new Error('DATABASE_WRITE_FAILED'),
    )

    renderProjectRoute()

    const favoriteButton = await findFavoriteButton(project.name)

    await user.click(favoriteButton)

    const main = screen.getByRole('main')

    expect(await within(main).findByRole('alert')).toBeInTheDocument()

    await user.click(favoriteButton)

    await waitFor(() => {
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    })

    expect(within(main).queryByRole('alert')).not.toBeInTheDocument()

    expect(await findFavoriteNavigation()).toBeInTheDocument()
  })

  it('recovers the favorites section after a failed read', async () => {
    const user = userEvent.setup()

    const project = await projectRepository.createProject({
      name: 'Saturnino',
    })

    await projectRepository.toggleProjectFavorite(project.id)

    const readProjectsSpy = vi
      .spyOn(projectRepository, 'getProjects')
      .mockRejectedValue(new Error('DATABASE_READ_FAILED'))

    renderProjectRoute('/app')

    const sidebar = await screen.findByRole('complementary')

    expect(await within(sidebar).findByRole('alert')).toHaveTextContent(
      'Unable to load favorite projects.',
    )

    readProjectsSpy.mockRestore()

    const favoritesTrigger = within(sidebar).getByRole('button', {
      name: 'Favorites',
    })

    const favoritesContentId = favoritesTrigger.getAttribute('aria-controls')
    const favoritesContent = document.getElementById(favoritesContentId)

    expect(favoritesContent).toBeInTheDocument()

    await user.click(
      within(favoritesContent).getByRole('button', {
        name: 'Try again',
      }),
    )

    const navigation = await findFavoriteNavigation()

    expect(
      within(navigation).getByRole('link', {
        name: project.name,
      }),
    ).toBeInTheDocument()

    expect(within(sidebar).queryByRole('alert')).not.toBeInTheDocument()
  })
})
