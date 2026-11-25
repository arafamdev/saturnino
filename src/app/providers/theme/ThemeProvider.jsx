import { useEffect, useState } from 'react'

import { ThemeContext } from './ThemeContext'

const DEFAULT_THEME = 'dark'
const THEME_STORAGE_KEY = 'saturnino-theme'

function getInitialTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }
  } catch {
    // Use the default theme when storage is unavailable.
  }

  return DEFAULT_THEME
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Keep theme switching available without persistent storage.
    }
  }, [theme])

  const contextValue = {
    theme,
    toggleTheme,
  }

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}

export default ThemeProvider
