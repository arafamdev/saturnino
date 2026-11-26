import 'fake-indexeddb/auto'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { database } from '@/lib/db/database'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import KanbanBoard from './KanbanBoard'

let project
function ReactiveBoard({ movementRestricted = false, onlyTodo = false }) {
  const { tasks } = useTasks(project.id)
  return (
    <MemoryRouter>
      <KanbanBoard
        projectId={project.id}
        movementRestricted={movementRestricted}
        tasks={
          onlyTodo ? tasks.filter((task) => task.status === 'todo') : tasks
        }
        projects={[project]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  await database.tasks.clear()
  await database.projects.clear()
  project = await projectRepository.createProject({ name: 'Kanban QA' })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('moves a task to a different column, persists completion and restores focus', async () => {
  const user = userEvent.setup()
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Ship board',
  })
  render(<ReactiveBoard />)
  const select = await screen.findByRole('combobox', {
    name: 'Move Ship board to status',
  })
  await user.selectOptions(select, 'done')
  await waitFor(async () =>
    expect(await taskRepository.getTaskById(task.id)).toMatchObject({
      status: 'done',
      position: 0,
      completedAt: expect.any(String),
    }),
  )
  await waitFor(() =>
    expect(
      screen.getByRole('combobox', { name: 'Move Ship board to status' }),
    ).toHaveFocus(),
  )
  expect(screen.getByRole('status', { name: 'Task view' })).toHaveTextContent(
    'Ship board moved to Done.',
  )
})

it('reorders within a column using buttons and preserves boundary focus', async () => {
  const user = userEvent.setup()
  const first = await taskRepository.createTask({
    projectId: project.id,
    title: 'First',
  })
  const second = await taskRepository.createTask({
    projectId: project.id,
    title: 'Second',
  })
  render(<ReactiveBoard />)
  await user.click(
    await screen.findByRole('button', { name: 'Move Second up' }),
  )
  await waitFor(async () =>
    expect(
      (await taskRepository.getTasks(project.id)).map((task) => task.id),
    ).toEqual([second.id, first.id]),
  )
  const up = screen.getByRole('button', { name: 'Move Second up' })
  await waitFor(() => expect(up).toHaveFocus())
  expect(up).toHaveAttribute('aria-disabled', 'true')
  await user.click(up)
  expect((await taskRepository.getTaskById(second.id)).position).toBe(0)
})

it('preserves persisted order on failure and allows a new attempt', async () => {
  const user = userEvent.setup()
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Retry move',
  })
  const move = vi
    .spyOn(taskRepository, 'moveTask')
    .mockRejectedValueOnce(new Error('WRITE_FAILED'))
  render(<ReactiveBoard />)
  await user.selectOptions(
    await screen.findByRole('combobox', { name: 'Move Retry move to status' }),
    'done',
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'previous order was preserved',
  )
  expect((await taskRepository.getTaskById(task.id)).status).toBe('todo')
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Move Retry move to status' }),
    'done',
  )
  await waitFor(async () =>
    expect((await taskRepository.getTaskById(task.id)).status).toBe('done'),
  )
  expect(move).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('renders four empty drop targets and a labelled mobile column selector', async () => {
  render(<ReactiveBoard />)
  expect(screen.getAllByText('No tasks in this column.')).toHaveLength(4)
  const column = screen.getByRole('combobox', { name: 'Visible column' })
  await userEvent.selectOptions(column, 'backlog')
  expect(column).toHaveValue('backlog')
})

it('blocks overlapping writes until storage finishes', async () => {
  const user = userEvent.setup()
  await taskRepository.createTask({ projectId: project.id, title: 'Pending' })
  const original = taskRepository.moveTask.bind(taskRepository)
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const spy = vi
    .spyOn(taskRepository, 'moveTask')
    .mockImplementation(async (...args) => {
      await gate
      return original(...args)
    })
  render(<ReactiveBoard />)
  await user.selectOptions(
    await screen.findByRole('combobox', { name: 'Move Pending to status' }),
    'done',
  )
  expect(
    screen.getByRole('combobox', { name: 'Move Pending to status' }),
  ).toBeDisabled()
  expect(screen.getByRole('status', { name: 'Task view' })).toHaveTextContent(
    'Saving task movement',
  )
  expect(spy).toHaveBeenCalledTimes(1)
  release()
  await waitFor(() =>
    expect(
      screen.getByRole('combobox', { name: 'Move Pending to status' }),
    ).toBeEnabled(),
  )
})

it('explains a stale task conflict without overwriting it', async () => {
  const user = userEvent.setup()
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Conflict',
  })
  vi.spyOn(taskRepository, 'moveTask').mockRejectedValueOnce(
    new Error('TASK_MOVE_CONFLICT'),
  )
  render(<ReactiveBoard />)
  await user.selectOptions(
    await screen.findByRole('combobox', { name: 'Move Conflict to status' }),
    'done',
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'changed during the movement',
  )
  expect((await taskRepository.getTaskById(task.id)).status).toBe('todo')
})

it('restricts position changes under filters but keeps status changes available', async () => {
  const user = userEvent.setup()
  const first = await taskRepository.createTask({
    projectId: project.id,
    title: 'Filtered first',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Filtered second',
  })
  render(<ReactiveBoard movementRestricted />)
  const down = await screen.findByRole('button', {
    name: 'Move Filtered first down',
  })
  expect(down).toHaveAttribute('aria-disabled', 'true')
  await user.click(down)
  expect((await taskRepository.getTaskById(first.id)).position).toBe(0)
  expect(
    screen.getByText(/Clear filters and select manual order/),
  ).toBeInTheDocument()
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Move Filtered first to status' }),
    'done',
  )
  await waitFor(async () =>
    expect((await taskRepository.getTaskById(first.id)).status).toBe('done'),
  )
})

it('returns focus to the board when a status change hides the filtered card', async () => {
  const user = userEvent.setup()
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Will disappear',
  })
  render(<ReactiveBoard movementRestricted onlyTodo />)
  await user.selectOptions(
    await screen.findByRole('combobox', {
      name: 'Move Will disappear to status',
    }),
    'done',
  )
  await waitFor(() =>
    expect(
      screen.queryByRole('heading', { name: 'Will disappear' }),
    ).not.toBeInTheDocument(),
  )
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Board' })).toHaveFocus(),
  )
})
