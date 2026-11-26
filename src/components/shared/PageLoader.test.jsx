import { describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'

import i18n from '@/i18n'

import PageLoader from './PageLoader'

describe('PageLoader', () => {
  it('renders an accessible loading status in English', () => {
    render(<PageLoader />)

    const loadingStatus = screen.getByRole('status')

    expect(
      within(loadingStatus).getByText('Loading Saturnino...'),
    ).toBeInTheDocument()
  })

  it('renders the loading status in Portuguese', async () => {
    await i18n.changeLanguage('pt-PT')

    render(<PageLoader />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'A carregar o Saturnino...',
    )
  })

  it('updates the loading message when changing language', async () => {
    render(<PageLoader />)

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'A carregar o Saturnino...',
    )
  })
})
