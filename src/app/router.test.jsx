import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'

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
        name: 'About Saturnino',
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
})
