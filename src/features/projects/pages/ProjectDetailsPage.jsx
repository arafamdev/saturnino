import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { t } = useTranslation('app')

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t('projectDetails.title')}</h1>

      <p className="text-muted-foreground">
        {t('projectDetails.identifier', { projectId })}
      </p>
    </section>
  )
}

export default ProjectDetailsPage
