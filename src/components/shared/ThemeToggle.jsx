import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { useTheme } from '@/app/providers/theme/useTheme'

function ThemeToggle() {
  const { t } = useTranslation('common')
  const { theme, toggleTheme } = useTheme()

  const isDarkTheme = theme === 'dark'
  const ThemeIcon = isDarkTheme ? Sun : Moon

  const accessibleLabel = isDarkTheme
    ? t('theme.switchToLight')
    : t('theme.switchToDark')

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
