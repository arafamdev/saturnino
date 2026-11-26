import { ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'

import { useSidebar } from '../hooks/useSidebar'

import './sidebarSection.css'

function SidebarSection({ sectionId, title, children }) {
  const { expandedSections, toggleSection } = useSidebar()

  const isExpanded = expandedSections[sectionId]

  function handleOpenChange(nextIsExpanded) {
    if (nextIsExpanded !== isExpanded) {
      toggleSection(sectionId)
    }
  }

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={handleOpenChange}
      className="flex flex-col gap-1"
    >
      {/* Section header */}
      <Collapsible.Trigger
        type="button"
        className="group flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-0 truncate">{title}</span>

        <ChevronDown
          className="size-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:-rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Collapsible.Trigger>

      {/* Section content */}
      <Collapsible.Content className="overflow-hidden motion-safe:data-[state=open]:animate-[sidebar-expand_200ms_ease-out] motion-safe:data-[state=closed]:animate-[sidebar-collapse_200ms_ease-in]">
        <div className="p-1">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export default SidebarSection
