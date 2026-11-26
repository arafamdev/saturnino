import { useState } from 'react'

import { Menu, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import Logo from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'

import { sidebarSectionIds } from '../state/sidebarReducer'

import AppNavigation from './AppNavigation'
import SidebarSection from './SidebarSection'
import WorkspaceIndicator from './WorkspaceIndicator'

function MobileNavigation() {
  const { t } = useTranslation('app')
  const [isOpen, setIsOpen] = useState(false)

  function handleCloseMenu() {
    setIsOpen(false)
  }

  return (
    <div className="shrink-0 lg:hidden">
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label={t('navigation.openMenu')}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 lg:hidden" />

          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-background shadow-xl lg:hidden">
            <Dialog.Title className="sr-only">
              {t('navigation.label')}
            </Dialog.Title>

            <Dialog.Description className="sr-only">
              {t('navigation.menuDescription')}
            </Dialog.Description>

            {/* Menu header */}
            <div className="flex items-center justify-between gap-2 border-b p-4">
              <Logo />

              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0"
                  aria-label={t('navigation.closeMenu')}
                >
                  <X className="size-5" aria-hidden="true" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Navigation sections */}
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarSection
                sectionId={sidebarSectionIds.WORKSPACE}
                title={t('workspace.title')}
              >
                <AppNavigation onNavigate={handleCloseMenu} />
              </SidebarSection>
            </div>

            {/* Workspace information */}
            <div className="border-t p-3">
              <WorkspaceIndicator />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default MobileNavigation
