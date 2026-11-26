import { Tooltip } from 'radix-ui'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

import { navigationItems } from '../data/navigationItems'

import { cn } from '@/lib/utils'

function AppNavigation({ onNavigate, compact = false }) {
  const { t } = useTranslation('app')

  return (
    <Tooltip.Provider delayDuration={200}>
      <nav aria-label={t('navigation.label')} className="flex flex-col gap-1">
        {navigationItems.map(({ labelKey, to, icon: Icon, end }) => (
          <Tooltip.Root key={to}>
            <Tooltip.Trigger asChild>
              <NavLink
                aria-label={compact ? t(labelKey) : undefined}
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

                <span className={compact ? 'sr-only' : undefined}>
                  {t(labelKey)}
                </span>
              </NavLink>
            </Tooltip.Trigger>
            {compact && (
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="z-50 rounded border bg-popover px-3 py-2 text-sm text-popover-foreground shadow"
                >
                  {t(labelKey)}
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
        ))}
      </nav>
    </Tooltip.Provider>
  )
}

export default AppNavigation
