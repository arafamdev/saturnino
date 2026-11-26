import { ArrowRight, FolderKanban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import ProjectActionsMenu from './ProjectActionsMenu'
import ProjectFavoriteButton from './ProjectFavoriteButton'

function ProjectCard({ project, onEdit, onDelete }) {
  const { t } = useTranslation('app')

  return (
    <article className="group relative flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 focus-within:border-primary/40">
      {/* Project header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <FolderKanban
            className="size-5"
            style={{ color: project.color }}
            aria-hidden="true"
          />
        </div>

        {/* Project actions */}
        <div className="flex items-center gap-1">
          <ProjectFavoriteButton project={project} />

          <ProjectActionsMenu
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
            className="relative z-10"
          />
        </div>
      </div>

      {/* Project information */}
      <div className="flex-1 space-y-2">
        <h2 className="text-base font-semibold wrap-break-word">
          {project.name}
        </h2>

        <p className="line-clamp-2 text-sm wrap-break-word text-muted-foreground">
          {project.description || t('projects.noDescription')}
        </p>
      </div>

      {/* Project navigation */}
      <div className="mt-5 border-t pt-4">
        <Link
          to={`/app/projects/${project.id}`}
          aria-label={t('projects.actions.viewNamed', {
            name: project.name,
          })}
          className="flex items-center justify-between gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-0 after:rounded-xl after:content-[''] after:cursor-pointer group-hover:text-primary focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {t('projects.actions.view')}

          <ArrowRight
            className="size-4 transition-transform motion-safe:group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  )
}

export default ProjectCard
