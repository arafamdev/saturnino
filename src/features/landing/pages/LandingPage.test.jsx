import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import LandingPage from './LandingPage'

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('renders the main heading', () => {
    renderLandingPage()

    const heading = screen.getByRole('heading', {
      name: 'Bring your work into orbit.',
      level: 1,
    })

    expect(heading).toBeInTheDocument()
  })

  it('renders the application slogan', () => {
    renderLandingPage()

    const heroSection = screen.getByRole('region', {
      name: 'Bring your work into orbit.',
    })

    const slogan = within(heroSection).getByText('Everything in its orbit.')

    expect(slogan).toBeInTheDocument()
  })

  it('provides a link to the application in the hero section', () => {
    renderLandingPage()

    const heroSection = screen.getByRole('region', {
      name: 'Bring your work into orbit.',
    })

    const applicationLink = within(heroSection).getByRole('link', {
      name: 'Open Saturnino',
    })

    expect(applicationLink).toHaveAttribute('href', '/app')
  })

  it('provides a link to the application in the final CTA', () => {
    renderLandingPage()

    const finalCTASection = screen.getByRole('region', {
      name: 'Ready to bring your work into orbit?',
    })

    const applicationLink = within(finalCTASection).getByRole('link', {
      name: 'Open Saturnino',
    })

    expect(applicationLink).toHaveAttribute('href', '/app')
  })
})
