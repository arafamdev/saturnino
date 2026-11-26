import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import PwaProvider from '@/features/pwa/context/PwaProvider'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { database } from '@/lib/db/database'

import i18n from '@/i18n'

import { routes } from './router'

function renderRoute(initialPath = '/') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  })

  return render(
    <ThemeProvider>
      <PwaProvider>
        <RouterProvider router={router} />
      </PwaProvider>
    </ThemeProvider>,
  )
}

describe('Application routing', () => {
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

  it('renders the landing page at the root route', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', {
        name: 'Bring your work into orbit.',
      }),
    ).toBeInTheDocument()
  })

  it('navigates from the landing page to the application', async () => {
    const user = userEvent.setup()

    renderRoute('/')

    const heroSection = await screen.findByRole('region', {
      name: 'Bring your work into orbit.',
    })

    await user.click(
      within(heroSection).getByRole('link', {
        name: 'Open Saturnino',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Overview',
      }),
    ).toBeInTheDocument()
  })

  it('renders the tasks page', async () => {
    renderRoute('/app/tasks')

    expect(
      await screen.findByRole('heading', {
        name: 'My Tasks',
      }),
    ).toBeInTheDocument()
  })

  it('renders the projects page', async () => {
    renderRoute('/app/projects')

    expect(
      await screen.findByRole('heading', {
        name: 'Projects',
      }),
    ).toBeInTheDocument()
  })

  it('renders the settings page', async () => {
    renderRoute('/app/settings')

    expect(
      await screen.findByRole('heading', {
        name: 'Settings',
      }),
    ).toBeInTheDocument()
  })

  it('highlights the active navigation link', async () => {
    renderRoute('/app/projects')

    const projectsLink = await screen.findByRole('link', {
      name: 'Projects',
    })

    const overviewLink = screen.getByRole('link', {
      name: 'Overview',
    })

    expect(projectsLink).toHaveAttribute('aria-current', 'page')
    expect(overviewLink).not.toHaveAttribute('aria-current')
  })

  it('renders the project associated with the URL identifier', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
      description: 'Personal productivity application',
    })

    renderRoute(`/app/projects/${project.id}`)

    expect(
      await screen.findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(project.description)).toBeInTheDocument()
  })

  it('renders a not found state for a missing project', async () => {
    renderRoute('/app/projects/missing-project')

    expect(
      await screen.findByRole('heading', {
        name: 'Project not found',
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Back to projects',
      }),
    ).toHaveAttribute('href', '/app/projects')
  })

  it('renders the about page', async () => {
    renderRoute('/about')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /every name has a story\.\s*this one has a legacy\./i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the not found page for unknown routes', async () => {
    renderRoute('/unknown')

    expect(
      await screen.findByRole('heading', {
        name: '404',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('returns to the landing page from the not found page', async () => {
    const user = userEvent.setup()

    renderRoute('/unknown')

    await user.click(
      await screen.findByRole('link', {
        name: 'Back to home',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Bring your work into orbit.',
      }),
    ).toBeInTheDocument()
  })

  it.each([
    ['/app', 'Visão geral'],
    ['/app/tasks', 'As minhas tarefas'],
    ['/app/projects', 'Projetos'],
    ['/app/settings', 'Definições'],
  ])('renders %s in Portuguese', async (path, heading) => {
    await i18n.changeLanguage('pt-PT')

    renderRoute(path)

    expect(
      await screen.findByRole('heading', {
        name: heading,
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('preserves the active navigation link when changing language', async () => {
    renderRoute('/app/projects')

    await screen.findByRole('heading', {
      name: 'Projects',
    })

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })

    const projectsLink = within(navigation).getByRole('link', {
      name: 'Projetos',
    })

    expect(projectsLink).toHaveAttribute('aria-current', 'page')
    expect(projectsLink).toHaveAttribute('href', '/app/projects')

    expect(
      within(navigation).getByRole('link', {
        name: 'Visão geral',
      }),
    ).not.toHaveAttribute('aria-current')
  })

  it('preserves project data when changing language', async () => {
    const project = await projectRepository.createProject({
      name: 'Saturnino',
      description: 'Personal productivity application',
    })

    renderRoute(`/app/projects/${project.id}`)

    expect(
      await screen.findByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    expect(
      screen.getByRole('heading', {
        name: project.name,
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(project.description)).toBeInTheDocument()

    expect(
      within(
        screen.getByRole('navigation', { name: 'Caminho de navegação' }),
      ).getByRole('link', {
        name: 'Projetos',
      }),
    ).toHaveAttribute('href', '/app/projects')
  })

  it('renders the not found page and home link in Portuguese', async () => {
    const user = userEvent.setup()

    await i18n.changeLanguage('pt-PT')

    renderRoute('/unknown')

    expect(await screen.findByText('Página não encontrada')).toBeInTheDocument()

    expect(
      screen.getByText('Esta página está fora da nossa órbita.'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', {
        name: 'Voltar ao início',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Coloca o teu trabalho em órbita.',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('allows changing language from the application header', async () => {
    const user = userEvent.setup()

    renderRoute('/app')

    const languageSwitcher = await screen.findByRole('group', {
      name: 'Change language',
    })

    await user.click(
      within(languageSwitcher).getByRole('button', {
        name: 'Português',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Visão geral',
      }),
    ).toBeInTheDocument()

    expect(i18n.resolvedLanguage).toBe('pt-PT')
  })
})
