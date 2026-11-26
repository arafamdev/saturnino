import { useTranslation } from 'react-i18next'

import SidebarProjectItem from './SidebarProjectItem'

function SidebarProjectList({
  projects,
  label,
  emptyMessage,
  loadingMessage,
  errorMessage,
  isLoading,
  isError,
  retry,
  announceStatus = false,
  onNavigate,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation('app')

  if (isError) {
    return (
      <div className="space-y-2 px-3 py-2">
        <p
          role={announceStatus ? 'alert' : undefined}
          className="text-xs text-muted-foreground"
        >
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={retry}
          className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t('projects.actions.retry')}
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <p
        role={announceStatus ? 'status' : undefined}
        className="px-3 py-2 text-xs text-muted-foreground"
      >
        {loadingMessage}
      </p>
    )
  }

  if (projects.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground">{emptyMessage}</p>
    )
  }

  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      {projects.map((project) => (
        <SidebarProjectItem
          key={project.id}
          project={project}
          onNavigate={onNavigate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </nav>
  )
}

export default SidebarProjectList
