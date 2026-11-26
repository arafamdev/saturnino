import { useTranslation } from 'react-i18next'

import TaskCollection from '../components/TaskCollection'

function TasksPage() {
  const { t } = useTranslation('app')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('navigation.tasks')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('tasks.description')}
        </p>
      </div>
      <TaskCollection />
    </div>
  )
}

export default TasksPage
