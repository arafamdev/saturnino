import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import AboutPage from './AboutPage'

function renderAboutPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )
}

describe('AboutPage', () => {
  it('renders the main heading', () => {
    renderAboutPage()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /every name has a story\.\s*this one has a legacy\./i,
      }),
    ).toBeInTheDocument()
  })

  it('renders both family portraits', () => {
    renderAboutPage()

    expect(
      screen.getByRole('img', {
        name: 'Portrait of Manuel Saturnino da Costa',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('img', {
        name: 'Another portrait of Manuel Saturnino da Costa',
      }),
    ).toBeInTheDocument()
  })

  it('renders all four historical milestones', () => {
    renderAboutPage()

    const timelineSection = screen.getByRole('region', {
      name: 'A life of purpose.',
    })

    const timeline = within(timelineSection).getByRole('list', {
      name: 'Historical milestones',
    })

    expect(within(timeline).getAllByRole('listitem')).toHaveLength(4)

    const milestoneTitles = [
      'The struggle for freedom',
      'A life of service',
      'National leadership',
      'An enduring legacy',
    ]

    milestoneTitles.forEach((title) => {
      expect(
        within(timeline).getByRole('heading', {
          name: title,
          level: 3,
        }),
      ).toBeInTheDocument()
    })
  })

  it('keeps historical sources collapsed initially', () => {
    renderAboutPage()

    const sourcesSummary = screen.getByText('Discover his story')
    const sourcesDetails = sourcesSummary.closest('details')

    expect(sourcesDetails).not.toHaveAttribute('open')
  })

  it('expands and collapses historical sources', async () => {
    const user = userEvent.setup()

    renderAboutPage()

    const sourcesSummary = screen.getByText('Discover his story')
    const sourcesDetails = sourcesSummary.closest('details')

    await user.click(sourcesSummary)

    expect(sourcesDetails).toHaveAttribute('open')

    await user.click(sourcesSummary)

    expect(sourcesDetails).not.toHaveAttribute('open')
  })

  it('provides three external historical sources', async () => {
    const user = userEvent.setup()

    renderAboutPage()

    const sourcesSummary = screen.getByText('Discover his story')

    await user.click(sourcesSummary)

    const sourcesDetails = sourcesSummary.closest('details')
    const sourceLinks = within(sourcesDetails).getAllByRole('link')

    expect(sourceLinks).toHaveLength(3)

    sourceLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toMatch(/^https:\/\//)
    })
  })

  it('renders the three project principles', () => {
    renderAboutPage()

    const purposeSection = screen.getByRole('region', {
      name: 'Small steps. Meaningful progress.',
    })

    const principles = ['Organize.', 'Focus.', 'Evolve.']

    principles.forEach((principle) => {
      expect(
        within(purposeSection).getByRole('heading', {
          name: principle,
        }),
      ).toBeInTheDocument()
    })
  })

  it('renders the memorial section', () => {
    renderAboutPage()

    const memorialSection = screen.getByRole('region', {
      name: 'Some legacies live forever.',
    })

    expect(
      within(memorialSection).getByText('Manuel Saturnino da Costa'),
    ).toBeInTheDocument()

    expect(
      within(memorialSection).getByText(
        'Built with purpose. Inspired by legacy.',
      ),
    ).toBeInTheDocument()
  })
})
