import { useEffect } from 'react'

import { ArrowLeft, FolderKanban, LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import TaskCollection from '@/features/tasks/components/TaskCollection'
import { useSidebar } from '@/layouts/hooks/useSidebar'

import ProjectsErrorState from '../components/ProjectsErrorState'
import { useProject } from '../hooks/useProject'

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { t } = useTranslation('app')
  const { recordProjectAccess } = useSidebar()

  const { project, isLoading, isNotFound, isError, retry } =
    useProject(projectId)

  const visitedProjectId =
    !isLoading && !isError && !isNotFound && project?.id === projectId
      ? project.id
      : null

  useEffect(() => {
    if (visitedProjectId) {
      recordProjectAccess(visitedProjectId)
    }
  }, [visitedProjectId, recordProjectAccess])

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
    <TaskCollection key={project.id} projectId={project.id} project={project} />
  )
}

export default ProjectDetailsPage
