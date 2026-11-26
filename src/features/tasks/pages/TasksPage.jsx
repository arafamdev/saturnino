import { useTranslation } from 'react-i18next'

function TasksPage() {
  const { t } = useTranslation('app')

  return <h1 className="text-2xl font-semibold">{t('navigation.tasks')}</h1>
}

export default TasksPage
