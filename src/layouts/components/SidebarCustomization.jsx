import { useRef, useState } from 'react'

import { ArrowDown, ArrowUp, GripVertical, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog } from 'radix-ui'

import { Button } from '@/components/ui/button'
import {
  FormDialogHeader,
  formDialogContentClassName,
} from '@/components/ui/form-dialog'

import { useSidebar } from '../hooks/useSidebar'

import {
  initialSidebarState,
  sidebarActionTypes,
  sidebarReducer,
} from '../state/sidebarReducer'

const sectionLabelKeys = {
  workspace: 'workspace.title',
  favorites: 'favorites.title',
  recentProjects: 'recentProjects.title',
  projectExplorer: 'projectExplorer.title',
}

function SidebarCustomization() {
  const { t } = useTranslation('app')
  const sidebar = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full justify-start gap-2"
        >
          <Settings2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-normal text-left">
            {t('sidebar.customize')}
          </span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 bg-black/60" />
        <Dialog.Content
          className={`${formDialogContentClassName} z-80`}
          onEscapeKeyDown={(event) => event.stopPropagation()}
        >
          <CustomizationDraft
            sidebar={sidebar}
            onSave={(draft) => {
              sidebar.applyCustomization(draft)
              setIsOpen(false)
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CustomizationDraft({ sidebar, onSave }) {
  const { t } = useTranslation('app')
  const [draft, setDraft] = useState(() => ({
    sectionOrder: sidebar.sectionOrder,
    hiddenSections: sidebar.hiddenSections,
    reset: false,
  }))
  const { sectionOrder, hiddenSections } = draft
  const [announcement, setAnnouncement] = useState('')
  const [activeDrag, setActiveDrag] = useState(null)
  const draggedSection = useRef(null)
  const listRef = useRef(null)

  function moveSection(sectionId, targetId) {
    setDraft((current) =>
      sidebarReducer(current, {
        type: sidebarActionTypes.MOVE_SECTION,
        payload: { sectionId, targetId },
      }),
    )
  }

  function setSectionVisible(sectionId, visible) {
    setDraft((current) =>
      sidebarReducer(current, {
        type: sidebarActionTypes.SET_VISIBILITY,
        payload: { sectionId, visible },
      }),
    )
  }

  function reorder(sectionId, targetId) {
    if (!targetId || sectionId === targetId) return
    moveSection(sectionId, targetId)
    setAnnouncement(
      t('sidebar.moved', {
        name: t(sectionLabelKeys[sectionId]),
        position: sectionOrder.indexOf(targetId) + 1,
      }),
    )
  }

  function finishDrag(event) {
    if (
      !draggedSection.current ||
      draggedSection.current.pointerId !== event.pointerId
    )
      return
    const { sectionId } = draggedSection.current
    draggedSection.current = null
    setActiveDrag(null)
    const rows = Array.from(listRef.current.children)
    const target = rows.find((row) => {
      const bounds = row.getBoundingClientRect()
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      )
    })
    reorder(sectionId, target?.dataset.sectionId)
  }

  function cancelDrag(event) {
    if (draggedSection.current?.pointerId === event.pointerId) {
      draggedSection.current = null
      setActiveDrag(null)
    }
  }

  return (
    <>
      <FormDialogHeader
        icon={Settings2}
        title={t('sidebar.customize')}
        description={t('sidebar.customizeDescription')}
        closeLabel={t('sidebar.closeCustomize')}
      />
      <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('sidebar.reorderHelp')}
        </p>
        <ul
          ref={listRef}
          aria-label={t('sidebar.sections')}
          className="space-y-1"
        >
          {sectionOrder.map((id, index) => (
            <li
              key={id}
              data-section-id={id}
              className={`flex min-w-0 items-center gap-1 rounded-xl border bg-card p-2 ${activeDrag === id ? 'border-primary bg-primary/5' : ''}`}
            >
              <button
                type="button"
                aria-label={t('sidebar.drag', {
                  name: t(sectionLabelKeys[id]),
                })}
                className="flex min-h-11 w-11 shrink-0 touch-none items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onPointerDown={(event) => {
                  if (event.button !== 0 || draggedSection.current) return
                  draggedSection.current = {
                    sectionId: id,
                    pointerId: event.pointerId,
                  }
                  setActiveDrag(id)
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onPointerUp={finishDrag}
                onPointerCancel={cancelDrag}
                onLostPointerCapture={cancelDrag}
                onKeyDown={(event) => {
                  const offset =
                    event.key === 'ArrowUp'
                      ? -1
                      : event.key === 'ArrowDown'
                        ? 1
                        : 0
                  if (offset) {
                    event.preventDefault()
                    reorder(id, sectionOrder[index + offset])
                  }
                }}
              >
                <GripVertical className="size-4" aria-hidden="true" />
              </button>
              <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-xs sm:text-sm">
                <input
                  className="shrink-0 accent-primary"
                  type="checkbox"
                  checked={!hiddenSections.includes(id)}
                  disabled={id === 'workspace'}
                  onChange={(event) =>
                    setSectionVisible(id, event.target.checked)
                  }
                />
                <span className="min-w-0 wrap-anywhere">
                  {t(sectionLabelKeys[id])}
                </span>
              </label>
              {[
                [ArrowUp, -1, 'sidebar.moveUp'],
                [ArrowDown, 1, 'sidebar.moveDown'],
              ].map(([Icon, offset, key]) => (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 w-11 shrink-0 aria-disabled:opacity-50"
                  aria-disabled={!sectionOrder[index + offset]}
                  aria-label={t(key, { name: t(sectionLabelKeys[id]) })}
                  onClick={() => reorder(id, sectionOrder[index + offset])}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </Button>
              ))}
            </li>
          ))}
        </ul>

        {draft.reset && (
          <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            {t('sidebar.resetPending')}
          </p>
        )}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-4 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-h-11 max-w-full py-2 text-left whitespace-normal"
          onClick={() => {
            setDraft({ ...initialSidebarState, reset: true })
            setAnnouncement(t('sidebar.resetPending'))
          }}
        >
          {t('sidebar.reset')}
        </Button>
        <div className="flex flex-wrap gap-2">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" className="min-h-11">
              {t('sidebar.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            type="button"
            className="min-h-11"
            onClick={() =>
              onSave({ sectionOrder, hiddenSections, reset: draft.reset })
            }
          >
            {t('sidebar.save')}
          </Button>
        </div>
      </footer>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  )
}

export default SidebarCustomization
