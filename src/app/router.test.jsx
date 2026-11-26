import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'

import i18n from '@/i18n'

import { routes } from './router'

function renderRoute(initialPath = '/') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  })

  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
}

describe('Application routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the landing page at the root route', () => {
    renderRoute('/')

    expect(
      screen.getByRole('heading', {
        name: 'Bring your work into orbit.',
      }),
    ).toBeInTheDocument()
  })

  it('navigates from the landing page to the application', async () => {
    const user = userEvent.setup()

    renderRoute('/')

    const heroSection = screen.getByRole('region', {
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

  it('renders the tasks page', () => {
    renderRoute('/app/tasks')

    expect(
      screen.getByRole('heading', {
        name: 'My Tasks',
      }),
    ).toBeInTheDocument()
  })

  it('renders the projects page', () => {
    renderRoute('/app/projects')

    expect(
      screen.getByRole('heading', {
        name: 'Projects',
      }),
    ).toBeInTheDocument()
  })

  it('renders the settings page', () => {
    renderRoute('/app/settings')

    expect(
      screen.getByRole('heading', {
        name: 'Settings',
      }),
    ).toBeInTheDocument()
  })

  it('highlights the active navigation link', () => {
    renderRoute('/app/projects')

    const projectsLink = screen.getByRole('link', {
      name: 'Projects',
    })

    const overviewLink = screen.getByRole('link', {
      name: 'Overview',
    })

    expect(projectsLink).toHaveAttribute('aria-current', 'page')
    expect(overviewLink).not.toHaveAttribute('aria-current')
  })

  it('renders the project identifier from the URL', () => {
    renderRoute('/app/projects/demo-123')

    expect(screen.getByText('Project ID: demo-123')).toBeInTheDocument()
  })

  it('renders the about page', () => {
    renderRoute('/about')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /every name has a story\.\s*this one has a legacy\./i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the not found page for unknown routes', () => {
    renderRoute('/unknown')

    expect(
      screen.getByRole('heading', {
        name: '404',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('returns to the landing page from the not found page', async () => {
    const user = userEvent.setup()

    renderRoute('/unknown')

    await user.click(
      screen.getByRole('link', {
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
      screen.getByRole('heading', {
        name: heading,
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('preserves the active navigation link when changing language', async () => {
    renderRoute('/app/projects')

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

  it('preserves the project identifier when changing language', async () => {
    renderRoute('/app/projects/demo-123')

    expect(screen.getByText('Project ID: demo-123')).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    expect(
      screen.getByRole('heading', {
        name: 'Detalhes do projeto',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('ID do projeto: demo-123')).toBeInTheDocument()
  })

  it('renders the not found page and home link in Portuguese', async () => {
    const user = userEvent.setup()

    await i18n.changeLanguage('pt-PT')

    renderRoute('/unknown')

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()

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

    const languageSwitcher = screen.getByRole('group', {
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
