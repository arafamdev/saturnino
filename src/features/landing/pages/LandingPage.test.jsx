import { describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import i18n from '@/i18n'

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

  it('renders the main heading in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    renderLandingPage()

    expect(
      screen.getByRole('heading', {
        name: 'Coloca o teu trabalho em órbita.',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('updates the page when the language changes', async () => {
    renderLandingPage()

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    expect(
      screen.getByRole('heading', {
        name: 'Coloca o teu trabalho em órbita.',
        level: 1,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('en')
    })

    expect(
      screen.getByRole('heading', {
        name: 'Bring your work into orbit.',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('renders all feature titles in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    renderLandingPage()

    const featureTitles = [
      'Kanban Visual',
      'Gestão de Projetos',
      'Gestão de Tarefas',
      'Prioridades Inteligentes',
      'Acompanhamento do Progresso',
      'O Teu Espaço, à Tua Maneira',
    ]

    featureTitles.forEach((title) => {
      expect(
        screen.getByRole('heading', {
          name: title,
          level: 3,
        }),
      ).toBeInTheDocument()
    })
  })

  it('renders all board columns in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    renderLandingPage()

    const columnTitles = ['Por planear', 'Por fazer', 'Em curso', 'Concluído']

    columnTitles.forEach((title) => {
      expect(
        screen.getByRole('heading', {
          name: title,
          level: 3,
        }),
      ).toBeInTheDocument()
    })
  })

  it('renders translated board tasks and priorities', async () => {
    await i18n.changeLanguage('pt-PT')

    renderLandingPage()

    const taskHeading = screen.getByRole('heading', {
      name: 'Criar wireframes',
      level: 4,
    })

    const taskCard = taskHeading.closest('article')

    expect(taskCard).toBeInTheDocument()
    expect(within(taskCard).getByText('Alta')).toBeInTheDocument()
    expect(within(taskCard).getByText('Design')).toBeInTheDocument()
  })

  it('preserves the project progress when the language changes', async () => {
    renderLandingPage()

    const englishProgress = screen.getByRole('progressbar', {
      name: 'Project progress',
    })

    expect(englishProgress).toHaveAttribute('aria-valuenow', '25')
    expect(screen.getByText('25% complete')).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    const portugueseProgress = screen.getByRole('progressbar', {
      name: 'Progresso do projeto',
    })

    expect(portugueseProgress).toHaveAttribute('aria-valuenow', '25')

    expect(screen.getByText('25% concluído')).toBeInTheDocument()
  })

  it('preserves the application link in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    renderLandingPage()

    const heroSection = screen.getByRole('region', {
      name: 'Coloca o teu trabalho em órbita.',
    })

    const applicationLink = within(heroSection).getByRole('link', {
      name: 'Abrir Saturnino',
    })

    expect(applicationLink).toHaveAttribute('href', '/app')
  })
})
