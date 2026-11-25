import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import LandingPage from './LandingPage'

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', {
      name: 'Bring your work into orbit.',
      level: 1,
    })

    expect(heading).toBeInTheDocument()
  })

  it('renders the application slogan', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const slogan = screen.getByText('Everything in its orbit.')

    expect(slogan).toBeInTheDocument()
  })

  it('provides a link to the application', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const applicationLink = screen.getByRole('link', {
      name: 'Open Saturnino',
    })

    expect(applicationLink).toHaveAttribute('href', '/app')
  })
})
