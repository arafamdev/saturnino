import { useRef, useState } from 'react'

import { ArrowDown, ArrowUp, GripVertical, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { useSidebar } from '../hooks/useSidebar'

const sectionLabelKeys = {
  workspace: 'workspace.title',
  favorites: 'favorites.title',
  recentProjects: 'recentProjects.title',
  projectExplorer: 'projectExplorer.title',
}

function SidebarCustomization() {
  const { t } = useTranslation('app')
  const {
    sectionOrder,
    hiddenSections,
    setSectionVisible,
    moveSection,
    resetPreferences,
  } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const draggedSection = useRef(null)
  const listRef = useRef(null)

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
    const sectionId = draggedSection.current
    draggedSection.current = null
    if (!sectionId) return
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

  return (
    <div className="relative min-w-0 border-t pt-2">
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 w-full justify-start gap-2"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings2 className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{t('sidebar.customize')}</span>
      </Button>
      {isOpen && (
        <div className="space-y-2 p-1">
          <p className="text-xs text-muted-foreground">
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
                className="flex min-w-0 items-center gap-1 rounded border p-1"
              >
                <button
                  type="button"
                  aria-label={t('sidebar.drag', {
                    name: t(sectionLabelKeys[id]),
                  })}
                  className="flex min-h-11 w-7 shrink-0 touch-none items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onPointerDown={(event) => {
                    if (event.button !== 0) return
                    draggedSection.current = id
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }}
                  onPointerUp={finishDrag}
                  onPointerCancel={() => {
                    draggedSection.current = null
                  }}
                  onLostPointerCapture={() => {
                    draggedSection.current = null
                  }}
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
                <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={!hiddenSections.includes(id)}
                    disabled={id === 'workspace'}
                    onChange={(event) =>
                      setSectionVisible(id, event.target.checked)
                    }
                  />
                  <span className="min-w-0 truncate">
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
                    className="min-h-11 w-7 shrink-0 aria-disabled:opacity-50"
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
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-11 w-full px-2 py-2 text-xs whitespace-normal"
            onClick={() => {
              resetPreferences()
              setAnnouncement(t('sidebar.resetDone'))
            }}
          >
            {t('sidebar.reset')}
          </Button>
        </div>
      )}
      <p role="status" className="sr-only top-0 left-0">
        {announcement}
      </p>
    </div>
  )
}

export default SidebarCustomization
