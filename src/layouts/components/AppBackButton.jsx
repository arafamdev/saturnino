import { useContext } from 'react'

import { ArrowLeft } from 'lucide-react'
import { Tooltip } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useNavigation } from 'react-router'

import { Button } from '@/components/ui/button'
import { NavigationHistoryContext } from '@/app/navigation/NavigationHistoryContext'
import {
  canGoBackInternally,
  navigationEntry,
} from '@/app/navigation/navigationHistory'

function AppBackButton() {
  const { t } = useTranslation('app')
  const journal = useContext(NavigationHistoryContext)
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const hasPrevious =
    journal && canGoBackInternally(journal, navigationEntry(location))
  const atFallback =
    location.pathname === '/app' && !location.search && !location.hash
  const disabled = navigation.state !== 'idle' || (!hasPrevious && atFallback)

  function goBack() {
    if (disabled) return
    if (hasPrevious) void navigate(-1)
    else void navigate('/app', { replace: true })
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            disabled={disabled}
            onClick={goBack}
            aria-label={t('navigation.back')}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={8}
            className="z-60 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm"
          >
            {t('navigation.back')}
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default AppBackButton
