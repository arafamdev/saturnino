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

async function chooseAction(user, title, action) {
  await user.click(
    await screen.findByRole('button', { name: `Actions for ${title}` }),
  )
  await user.click(screen.getByRole('menuitem', { name: action, exact: true }))
}

let project
function ReactiveBoard({
  movementRestricted = false,
  onlyTodo = false,
  onEdit = vi.fn(),
}) {
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
        onEdit={onEdit}
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
  // jsdom has no Web Animations API; the board disables drag animations.
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      constructor(type, options = {}) {
        super(type, options)
        Object.assign(this, {
          pointerId: options.pointerId ?? 1,
          pointerType: options.pointerType ?? 'mouse',
          isPrimary: options.isPrimary ?? true,
        })
      }
    },
  )
  vi.stubGlobal('Animation', class {})
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    })),
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => document.body,
  })
  Object.defineProperty(document, 'getAnimations', {
    configurable: true,
    value: () => [],
  })
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value: () => [],
  })
  await database.tasks.clear()
  await database.projects.clear()
  project = await projectRepository.createProject({ name: 'Kanban QA' })
})
afterEach(() => {
  delete document.elementFromPoint
  delete document.getAnimations
  delete Element.prototype.getAnimations
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
  await chooseAction(user, 'Ship board', 'Done')
  await waitFor(async () =>
    expect(await taskRepository.getTaskById(task.id)).toMatchObject({
      status: 'done',
      position: 0,
      completedAt: expect.any(String),
    }),
  )
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Actions for Ship board' }),
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
  await chooseAction(user, 'Second', 'Move Second up')
  await waitFor(async () =>
    expect(
      (await taskRepository.getTasks(project.id)).map((task) => task.id),
    ).toEqual([second.id, first.id]),
  )
  const trigger = screen.getByRole('button', { name: 'Actions for Second' })
  await waitFor(() => expect(trigger).toHaveFocus())
  await user.click(trigger)
  const up = screen.getByRole('menuitem', { name: 'Move Second up' })
  expect(up).toHaveAttribute('data-disabled')
  await user.click(up)
  await user.keyboard('{Escape}')
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
  await chooseAction(user, 'Retry move', 'Done')
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'previous order was preserved',
  )
  expect((await taskRepository.getTaskById(task.id)).status).toBe('todo')
  await chooseAction(user, 'Retry move', 'Done')
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
  await chooseAction(user, 'Pending', 'Done')
  expect(
    screen.getByRole('button', { name: 'Actions for Pending' }),
  ).toBeDisabled()
  expect(screen.getByRole('status', { name: 'Task view' })).toHaveTextContent(
    'Saving task movement',
  )
  expect(spy).toHaveBeenCalledTimes(1)
  release()
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Actions for Pending' }),
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
  await chooseAction(user, 'Conflict', 'Done')
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
  await user.click(
    await screen.findByRole('button', { name: 'Actions for Filtered first' }),
  )
  const down = screen.getByRole('menuitem', {
    name: 'Move Filtered first down',
  })
  expect(down).toHaveAttribute('data-disabled')
  await user.click(down)
  await user.keyboard('{Escape}')
  expect((await taskRepository.getTaskById(first.id)).position).toBe(0)
  expect(
    screen.getByText(/Clear filters and select manual order/),
  ).toBeInTheDocument()
  await chooseAction(user, 'Filtered first', 'Done')
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
  await chooseAction(user, 'Will disappear', 'Done')
  await waitFor(() =>
    expect(
      screen.queryByRole('heading', { name: 'Will disappear' }),
    ).not.toBeInTheDocument(),
  )
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Board' })).toHaveFocus(),
  )
})

it('starts from the keyboard handle and cancels without writing', async () => {
  const user = userEvent.setup()
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Keyboard surface',
  })
  const move = vi.spyOn(taskRepository, 'moveTask')
  render(<ReactiveBoard />)
  const handle = await screen.findByRole('button', {
    name: 'Drag Keyboard surface',
  })
  handle.focus()
  await user.keyboard(' ')
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'false'))
  expect(move).not.toHaveBeenCalled()
  expect((await taskRepository.getTaskById(task.id)).status).toBe('todo')
})

it('activates card and title after mouse distance while preserving clicks and menus', async () => {
  const user = userEvent.setup()
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Surface gestures',
  })
  const move = vi.spyOn(taskRepository, 'moveTask')
  const edit = vi.fn()
  render(<ReactiveBoard onEdit={edit} />)
  const handle = await screen.findByRole('button', {
    name: 'Drag Surface gestures',
  })
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'false'))
  const article = handle.closest('article')
  await user.pointer([
    { target: article, coords: { x: 10, y: 10 }, keys: '[MouseLeft>]' },
    { coords: { x: 13, y: 10 } },
  ])
  expect(handle).toHaveAttribute('aria-pressed', 'false')
  await user.pointer([{ coords: { x: 25, y: 10 } }])
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
  await user.keyboard('{Escape}')
  await user.pointer({ keys: '[/MouseLeft]' })
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'false'))
  const title = screen.getByRole('button', {
    name: 'Surface gestures',
    exact: true,
  })
  await user.pointer([
    { target: title, coords: { x: 10, y: 10 }, keys: '[MouseLeft>]' },
    { coords: { x: 13, y: 10 } },
  ])
  expect(handle).toHaveAttribute('aria-pressed', 'false')
  await user.pointer([{ coords: { x: 40, y: 10 } }])
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
  await user.keyboard('{Escape}')
  await user.pointer({ keys: '[/MouseLeft]' })
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'false'))
  expect(edit).not.toHaveBeenCalled()
  await user.click(title)
  expect(edit).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Surface gestures' }),
    title,
  )
  await user.click(
    screen.getByRole('button', { name: 'Actions for Surface gestures' }),
  )
  expect(
    screen.getByRole('menuitem', { name: 'Done', exact: true }),
  ).toBeVisible()
  expect(move).not.toHaveBeenCalled()
})

it('keeps touch scrolling gestures below the hold threshold from starting drag', async () => {
  const user = userEvent.setup()
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Touch surface',
  })
  render(<ReactiveBoard />)
  const handle = await screen.findByRole('button', {
    name: 'Drag Touch surface',
  })
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'false'))
  const article = handle.closest('article')
  await user.pointer([
    { target: article, coords: { x: 10, y: 10 }, keys: '[TouchA>]' },
    { pointerName: 'TouchA', coords: { x: 10, y: 45 } },
    { keys: '[/TouchA]' },
  ])
  expect(handle).toHaveAttribute('aria-pressed', 'false')
  expect((await taskRepository.getTasks(project.id))[0].status).toBe('todo')
})
