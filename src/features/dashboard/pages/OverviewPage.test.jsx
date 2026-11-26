import 'fake-indexeddb/auto'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { database } from '@/lib/db/database'
import { workspaceRepository } from '@/lib/db/workspaceRepository'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import i18n from '@/i18n'
import OverviewPage from './OverviewPage'

function renderOverview() {
  return render(
    <MemoryRouter>
      <OverviewPage />
    </MemoryRouter>,
  )
}
function metric(label) {
  return screen.getByText(label).closest('div').querySelector('dd')
}
beforeEach(async () => {
  await database.tasks.clear()
  await database.projects.clear()
})
afterEach(() => vi.restoreAllMocks())

it('shows a useful empty workspace without invalid percentages', async () => {
  renderOverview()
  expect(
    await screen.findByRole('heading', { name: 'Start your first project' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Go to projects' })).toHaveAttribute(
    'href',
    '/app/projects',
  )
  expect(metric('Completion rate')).toHaveTextContent('0%')
  expect(screen.getByText('No upcoming deadlines.')).toBeInTheDocument()
})

it('renders derived metrics, project progress and only upcoming open tasks', async () => {
  const project = await projectRepository.createProject({
    name: 'Dashboard QA',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Late open',
    dueDate: '2000-01-01',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Completed',
    status: 'done',
    dueDate: '2000-01-01',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Future task',
    dueDate: '9999-12-31',
  })
  renderOverview()
  await screen.findByRole('heading', { name: 'Project progress' })
  expect(metric('Tasks')).toHaveTextContent('3')
  expect(metric('Completed tasks')).toHaveTextContent('1')
  expect(metric('Overdue tasks')).toHaveTextContent('1')
  expect(metric('Completion rate')).toHaveTextContent('33%')
  expect(
    screen.getByRole('progressbar', { name: 'Progress for Dashboard QA' }),
  ).toHaveAttribute('value', '1')
  expect(
    screen.getByRole('progressbar', { name: 'Progress for Dashboard QA' }),
  ).toHaveAttribute('max', '3')
  expect(screen.getByRole('link', { name: 'Future task' })).toHaveAttribute(
    'href',
    `/app/projects/${project.id}`,
  )
  expect(
    screen.queryByRole('link', { name: 'Completed', exact: true }),
  ).not.toBeInTheDocument()
})

it('reacts to external completion, reopening and project deletion', async () => {
  const project = await projectRepository.createProject({ name: 'Reactive QA' })
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Reactive task',
  })
  renderOverview()
  await screen.findByRole('heading', { name: 'Project progress' })
  expect(metric('Completed tasks')).toHaveTextContent('0')
  await act(() =>
    taskRepository.updateTask(task.id, { ...task, status: 'done' }),
  )
  await waitFor(() =>
    expect(metric('Completion rate')).toHaveTextContent('100%'),
  )
  await act(() =>
    taskRepository.updateTask(task.id, { ...task, status: 'todo' }),
  )
  await waitFor(() => expect(metric('Completion rate')).toHaveTextContent('0%'))
  await act(() => projectRepository.deleteProject(project.id))
  expect(
    await screen.findByRole('heading', { name: 'Start your first project' }),
  ).toBeInTheDocument()
  expect(metric('Tasks')).toHaveTextContent('0')
})

it('keeps storage failures separate from an empty workspace and retries', async () => {
  const user = userEvent.setup()
  const spy = vi
    .spyOn(workspaceRepository, 'getSnapshot')
    .mockRejectedValue(new Error('READ_FAILED'))
  renderOverview()
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not load your overview',
  )
  expect(screen.queryByText('Start your first project')).not.toBeInTheDocument()
  spy.mockRestore()
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  expect(
    await screen.findByRole('heading', { name: 'Start your first project' }),
  ).toBeInTheDocument()
})

it('shows loading while a snapshot is pending', async () => {
  vi.spyOn(workspaceRepository, 'getSnapshot').mockImplementation(
    () => new Promise(() => {}),
  )
  renderOverview()
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Loading overview',
  )
  expect(screen.queryByText('Start your first project')).not.toBeInTheDocument()
})

it('renders the overview in Portuguese', async () => {
  await i18n.changeLanguage('pt-PT')
  renderOverview()
  expect(
    await screen.findByRole('heading', {
      name: 'Comece pelo primeiro projeto',
    }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Tarefas por estado' }),
  ).toBeInTheDocument()
  expect(metric('Taxa de conclusão')).toHaveTextContent('0%')
})
