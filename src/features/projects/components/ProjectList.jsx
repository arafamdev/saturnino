import { PlusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ProjectCard from './ProjectCard'

function ProjectList({ projects, onCreate, onEdit, onDelete }) {
  const { t } = useTranslation('app')

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <button
        type="button"
        onClick={onCreate}
        className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <PlusCircle className="size-7 text-primary" aria-hidden="true" />

        <span className="text-sm font-medium">
          {t('projects.actions.create')}
        </span>
      </button>
    </div>
  )
}

export default ProjectList
