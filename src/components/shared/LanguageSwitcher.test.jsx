import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LanguageSwitcher from './LanguageSwitcher'

import i18n from '@/i18n'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/languages'

describe('LanguageSwitcher', () => {
  it('displays English as the initial language', () => {
    render(<LanguageSwitcher />)

    const languageGroup = screen.getByRole('group', {
      name: 'Change language',
    })

    expect(
      within(languageGroup).getByRole('button', {
        name: 'English',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    expect(
      within(languageGroup).getByRole('button', {
        name: 'Português',
      }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the language to Portuguese', async () => {
    const user = userEvent.setup()

    render(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    expect(i18n.resolvedLanguage).toBe('pt-PT')

    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('switches back to English', async () => {
    const user = userEvent.setup()

    render(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(i18n.resolvedLanguage).toBe('en')
  })

  it('saves the selected language in localStorage', async () => {
    const user = userEvent.setup()

    render(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pt-PT')
  })

  it('updates the document language attribute', async () => {
    const user = userEvent.setup()

    render(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    expect(document.documentElement).toHaveAttribute('lang', 'pt-PT')
  })

  it('translates the accessible language switcher label', async () => {
    const user = userEvent.setup()

    render(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    expect(
      screen.getByRole('group', {
        name: 'Alterar idioma',
      }),
    ).toBeInTheDocument()
  })
})
