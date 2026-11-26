import { ArrowLeft, FolderKanban, LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { Button } from '@/components/ui/button'

import ProjectsErrorState from '../components/ProjectsErrorState'
import { useProject } from '../hooks/useProject'

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { t } = useTranslation('app')

  const { project, isLoading, isNotFound, isError, retry } =
    useProject(projectId)

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircle
          className="size-5 motion-safe:animate-spin"
          aria-hidden="true"
        />

        {t('projects.loading')}
      </div>
    )
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <Button asChild variant="outline">
          <Link to="/app/projects">
            <ArrowLeft aria-hidden="true" />
            {t('projectDetails.backToProjects')}
          </Link>
        </Button>

        <ProjectsErrorState onRetry={retry} />
      </section>
    )
  }

  if (isNotFound) {
    return (
      <section className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 text-center">
        <FolderKanban
          className="size-10 text-muted-foreground"
          aria-hidden="true"
        />

        <h1 className="text-xl font-semibold">
          {t('projectDetails.notFoundTitle')}
        </h1>

        <p className="max-w-sm text-sm text-muted-foreground">
          {t('projectDetails.notFoundDescription')}
        </p>

        <Button asChild variant="outline">
          <Link to="/app/projects">
            <ArrowLeft aria-hidden="true" />
            {t('projectDetails.backToProjects')}
          </Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('projectDetails.backToProjects')}
      </Link>

      {/* Project information */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <FolderKanban
            className="size-7"
            style={{ color: project.color }}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold wrap-break-word">
            {project.name}
          </h1>

          <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground">
            {project.description || t('projects.noDescription')}
          </p>
        </div>
      </div>

      {/* Future task management area */}
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
        <FolderKanban
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />

        <h2 className="font-medium">{t('projectDetails.tasksTitle')}</h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          {t('projectDetails.tasksDescription')}
        </p>
      </div>
    </section>
  )
}

export default ProjectDetailsPage
