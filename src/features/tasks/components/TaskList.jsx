import { useTranslation } from 'react-i18next'
import TaskCard from './TaskCard'

function TaskList({ tasks, projects, onEdit, onDelete }) {
  const { t } = useTranslation('app')
  const projectsById = new Map(projects.map((project) => [project.id, project]))
  return (
    <ul aria-label={t('tasks.listLabel')} className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            project={projectsById.get(task.projectId)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}
export default TaskList
