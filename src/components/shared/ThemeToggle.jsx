import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/providers/theme/useTheme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const isDarkTheme = theme === 'dark'
  const ThemeIcon = isDarkTheme ? Sun : Moon
  const accessibleLabel = isDarkTheme
    ? 'Switch to light mode'
    : 'Switch to dark mode'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11"
      onClick={toggleTheme}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <ThemeIcon aria-hidden="true" />
    </Button>
  )
}

export default ThemeToggle
