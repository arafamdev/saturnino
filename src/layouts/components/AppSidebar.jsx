import { useId, useRef, useState } from 'react'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Logo from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'

import { useSidebar } from '../hooks/useSidebar'
import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  normalizeSidebarWidth,
} from '../state/sidebarReducer'

import AppNavigation from './AppNavigation'
import SidebarCustomization from './SidebarCustomization'
import SidebarProjectSections from './SidebarProjectSections'
import WorkspaceIndicator from './WorkspaceIndicator'

function AppSidebar() {
  const { t } = useTranslation('app')
  const sidebarId = useId()
  const { width, compact, setWidth, setCompact } = useSidebar()
  const [draftWidth, setDraftWidth] = useState(null)
  const drag = useRef(null)

  function finishResize(event, cancelled = false) {
    if (!drag.current || event.pointerId !== drag.current.pointerId) return
    const nextWidth = normalizeSidebarWidth(
      drag.current.width + event.clientX - drag.current.x,
    )
    drag.current = null
    setDraftWidth(null)
    if (!cancelled) setWidth(nextWidth)
  }

  function resizeWithKeyboard(event) {
    const nextWidths = {
      ArrowLeft: width - 16,
      ArrowRight: width + 16,
      Home: MIN_SIDEBAR_WIDTH,
      End: MAX_SIDEBAR_WIDTH,
    }
    if (Object.hasOwn(nextWidths, event.key)) {
      event.preventDefault()
      setWidth(nextWidths[event.key])
    }
  }

  return (
    <aside
      id={sidebarId}
      style={{ width: compact ? 72 : (draftWidth ?? width) }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-muted/30 lg:flex"
    >
      <div className={compact ? 'flex justify-center py-5' : 'px-5 py-5'}>
        <Logo className={compact ? '[&>span]:sr-only' : undefined} />
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {compact ? (
          <AppNavigation compact />
        ) : (
          <>
            <SidebarProjectSections />
            <SidebarCustomization />
          </>
        )}
      </div>
      <div className="space-y-2 border-t p-3">
        <Button
          type="button"
          variant="ghost"
          size={compact ? 'icon' : 'default'}
          className="min-h-11 w-full gap-2"
          aria-label={t(compact ? 'sidebar.expand' : 'sidebar.compact')}
          aria-pressed={compact}
          onClick={() => setCompact(!compact)}
        >
          {compact ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="size-4" aria-hidden="true" />
              <span>{t('sidebar.compact')}</span>
            </>
          )}
        </Button>
        {!compact && <WorkspaceIndicator />}
      </div>
      {!compact && (
        <div
          role="separator"
          tabIndex={0}
          aria-label={t('sidebar.resize')}
          aria-orientation="vertical"
          aria-controls={sidebarId}
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          aria-valuenow={draftWidth ?? width}
          className="absolute inset-y-0 -right-1 z-10 w-2 touch-none cursor-col-resize hover:bg-primary/30 focus-visible:bg-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onKeyDown={resizeWithKeyboard}
          onPointerDown={(event) => {
            if (event.button !== 0 || drag.current) return
            event.preventDefault()
            event.currentTarget.focus()
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              width,
            }
          }}
          onPointerMove={(event) => {
            if (drag.current?.pointerId === event.pointerId)
              setDraftWidth(
                normalizeSidebarWidth(
                  drag.current.width + event.clientX - drag.current.x,
                ),
              )
          }}
          onPointerUp={finishResize}
          onPointerCancel={(event) => finishResize(event, true)}
          onLostPointerCapture={(event) => finishResize(event, true)}
        />
      )}
    </aside>
  )
}

export default AppSidebar
