import { useTranslation } from 'react-i18next'

function ProjectsPage() {
  const { t } = useTranslation('app')

  return <h1 className="text-2xl font-semibold">{t('navigation.projects')}</h1>
}

export default ProjectsPage
