import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

import { navigationItems } from '../data/navigationItems'

import { cn } from '@/lib/utils'

function AppNavigation({ onNavigate }) {
  const { t } = useTranslation('app')

  return (
    <nav aria-label={t('navigation.label')} className="flex flex-col gap-1">
      {navigationItems.map(({ labelKey, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />

          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default AppNavigation
