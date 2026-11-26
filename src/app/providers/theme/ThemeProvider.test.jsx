import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ThemeToggle from '@/components/shared/ThemeToggle'

import ThemeProvider from './ThemeProvider'
import { useTheme } from './useTheme'

const THEME_STORAGE_KEY = 'saturnino-theme'

function renderThemeToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.removeProperty('color-scheme')
  })

  it('uses dark mode by default', () => {
    renderThemeToggle()

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    expect(
      screen.getByRole('button', {
        name: 'Switch to light mode',
      }),
    ).toBeInTheDocument()
  })

  it('restores the stored light theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')

    renderThemeToggle()

    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('light')

    expect(
      screen.getByRole('button', {
        name: 'Switch to dark mode',
      }),
    ).toBeInTheDocument()
  })

  it('falls back to dark mode when the stored theme is invalid', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme')

    renderThemeToggle()

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('switches from dark to light mode', async () => {
    const user = userEvent.setup()

    renderThemeToggle()

    await user.click(
      screen.getByRole('button', {
        name: 'Switch to light mode',
      }),
    )

    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    expect(
      screen.getByRole('button', {
        name: 'Switch to dark mode',
      }),
    ).toBeInTheDocument()
  })

  it('switches from light to dark mode', async () => {
    const user = userEvent.setup()

    localStorage.setItem(THEME_STORAGE_KEY, 'light')

    renderThemeToggle()

    await user.click(
      screen.getByRole('button', {
        name: 'Switch to dark mode',
      }),
    )

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('preserves the selected theme after remounting', async () => {
    const user = userEvent.setup()
    const { unmount } = renderThemeToggle()

    await user.click(
      screen.getByRole('button', {
        name: 'Switch to light mode',
      }),
    )

    unmount()

    renderThemeToggle()

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })
})

function InvalidThemeControl() {
  const { setTheme } = useTheme()
  return <button onClick={() => setTheme('invalid')}>Invalid theme</button>
}

it('rejects unsupported themes through the explicit setter', async () => {
  localStorage.clear()
  render(
    <ThemeProvider>
      <InvalidThemeControl />
    </ThemeProvider>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Invalid theme' }))
  expect(document.documentElement).toHaveClass('dark')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
})
