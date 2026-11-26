import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'

import { routes } from '@/app/router'

function renderAppLayout(initialPath = '/app') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  })

  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
}

describe('Application layout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the workspace navigation', async () => {
    renderAppLayout()

    const navigation = await screen.findByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(navigation).getByRole('link', { name: 'Overview' }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', { name: 'My Tasks' }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', { name: 'Projects' }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', { name: 'Settings' }),
    ).toBeInTheDocument()
  })

  it('displays the local workspace indicator', async () => {
    renderAppLayout()

    expect(await screen.findByText('Local Workspace')).toBeInTheDocument()

    expect(screen.getByText('Stored on this device')).toBeInTheDocument()
  })

  it('displays the current page in the breadcrumbs', async () => {
    renderAppLayout('/app/tasks')

    const breadcrumbs = await screen.findByRole('navigation', {
      name: 'Breadcrumb',
    })

    expect(within(breadcrumbs).getByText('My Tasks')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('displays the parent project link in project details', async () => {
    renderAppLayout('/app/projects/demo-123')

    const breadcrumbs = await screen.findByRole('navigation', {
      name: 'Breadcrumb',
    })

    expect(
      within(breadcrumbs).getByRole('link', {
        name: 'Projects',
      }),
    ).toHaveAttribute('href', '/app/projects')

    expect(within(breadcrumbs).getByText('Project Details')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('keeps the projects navigation active on project details', async () => {
    renderAppLayout('/app/projects/demo-123')

    const navigation = await screen.findByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(navigation).getByRole('link', { name: 'Projects' }),
    ).toHaveAttribute('aria-current', 'page')

    expect(
      within(navigation).getByRole('link', { name: 'Overview' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('opens the mobile navigation menu', async () => {
    const user = userEvent.setup()

    renderAppLayout()

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    expect(
      await screen.findByRole('dialog', {
        name: 'Main navigation',
      }),
    ).toBeInTheDocument()
  })

  it('closes the mobile menu using the close button', async () => {
    const user = userEvent.setup()

    renderAppLayout()

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Close navigation menu',
      }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile menu when pressing Escape', async () => {
    const user = userEvent.setup()

    renderAppLayout()

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates and closes the mobile menu after selecting a link', async () => {
    const user = userEvent.setup()

    renderAppLayout()

    await user.click(
      await screen.findByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const dialog = await screen.findByRole('dialog')

    await user.click(
      within(dialog).getByRole('link', {
        name: 'My Tasks',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'My Tasks',
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
