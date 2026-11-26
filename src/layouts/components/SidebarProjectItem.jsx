import { NavLink } from 'react-router'

import ProjectActionsMenu from '@/features/projects/components/ProjectActionsMenu'
import { cn } from '@/lib/utils'

function SidebarProjectItem({ project, onNavigate, onEdit, onDelete }) {
  const hasActions = Boolean(onEdit && onDelete)

  return (
    <div className="flex min-w-0 items-center gap-1">
      <NavLink
        to={`/app/projects/${project.id}`}
        onClick={onNavigate}
        title={project.name}
        className={({ isActive }) =>
          cn(
            'flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            isActive
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )
        }
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
          aria-hidden="true"
        />

        <span className="min-w-0 truncate">{project.name}</span>
      </NavLink>

      {hasActions && (
        <ProjectActionsMenu
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

export default SidebarProjectItem
