import { describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import i18n from '@/i18n'

import SocialLinks from './SocialLinks'

describe('SocialLinks', () => {
  it('renders four accessible social links', () => {
    render(<SocialLinks />)

    const navigation = screen.getByRole('navigation', {
      name: 'Developer social links',
    })

    expect(within(navigation).getAllByRole('link')).toHaveLength(4)

    expect(
      within(navigation).getByRole('link', {
        name: 'GitHub (Opens in a new tab)',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'LinkedIn (Opens in a new tab)',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'Send an email',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'Personal website (Opens in a new tab)',
      }),
    ).toBeInTheDocument()
  })

  it.each([
    ['GitHub', 'https://github.com/arafamdev'],
    ['LinkedIn', 'https://www.linkedin.com/in/arafam-mussa-silla-5a7866446/'],
    ['Personal website', 'https://arafam.dev'],
  ])('opens the %s link securely in a new tab', (label, href) => {
    render(<SocialLinks />)

    const link = screen.getByRole('link', {
      name: `${label} (Opens in a new tab)`,
    })

    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('uses a mailto link without opening a new tab', () => {
    render(<SocialLinks />)

    const emailLink = screen.getByRole('link', {
      name: 'Send an email',
    })

    expect(emailLink).toHaveAttribute('href', 'mailto:arafam.dev@gmail.com')

    expect(emailLink).not.toHaveAttribute('target')
    expect(emailLink).not.toHaveAttribute('rel')
  })

  it('updates accessible labels when changing language', async () => {
    render(<SocialLinks />)

    await act(async () => {
      await i18n.changeLanguage('pt-PT')
    })

    const navigation = screen.getByRole('navigation', {
      name: 'Redes sociais do programador',
    })

    expect(
      within(navigation).getByRole('link', {
        name: 'GitHub (Abre num novo separador)',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'LinkedIn (Abre num novo separador)',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'Enviar um email',
      }),
    ).toBeInTheDocument()

    expect(
      within(navigation).getByRole('link', {
        name: 'Website pessoal (Abre num novo separador)',
      }),
    ).toBeInTheDocument()
  })

  it('supports keyboard navigation through all social links', async () => {
    const user = userEvent.setup()

    render(<SocialLinks />)

    const navigation = screen.getByRole('navigation', {
      name: 'Developer social links',
    })

    const links = within(navigation).getAllByRole('link')

    for (const link of links) {
      await user.tab()

      expect(link).toHaveFocus()
    }
  })
})
