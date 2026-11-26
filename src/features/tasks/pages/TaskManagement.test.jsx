import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { database } from '@/lib/db/database'
import i18n from '@/i18n'

import { taskRepository } from '../services/taskRepository'

function renderTasks(path = '/app/tasks') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const view = render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
  return { ...view, router }
}

async function mainRegion() {
  return within(await screen.findByRole('main'))
}

async function openCreate(user) {
  const main = await mainRegion()
  const button = await main.findByRole('button', { name: 'New task' })
  await waitFor(() => expect(button).toBeEnabled())
  await user.click(button)
  return within(await screen.findByRole('dialog', { name: 'Create task' }))
}

async function createTask(projectId, title = 'First task') {
  return taskRepository.createTask({ projectId, title })
}

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('en')
  await database.transaction(
    'rw',
    database.projects,
    database.tasks,
    async () => {
      await database.tasks.clear()
      await database.projects.clear()
    },
  )
})

afterEach(() => vi.restoreAllMocks())

describe('Task management integration', () => {
  it('requires a project before enabling creation', async () => {
    renderTasks()
    const main = await mainRegion()
    expect(
      await main.findByText('Create a project before adding tasks.'),
    ).toBeInTheDocument()
    expect(main.getByRole('button', { name: 'New task' })).toBeDisabled()
    expect(main.getByRole('link', { name: 'Go to projects' })).toHaveAttribute(
      'href',
      '/app/projects',
    )
  })

  it('creates a task with project, status, priority and calendar due date', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    renderTasks()
    const form = await openCreate(user)
    await user.type(
      form.getByRole('textbox', { name: 'Task title' }),
      'Build the first screen',
    )
    await user.selectOptions(
      form.getByRole('combobox', { name: 'Project' }),
      project.id,
    )
    await user.selectOptions(
      form.getByRole('combobox', { name: 'Status' }),
      'in-progress',
    )
    await user.selectOptions(
      form.getByRole('combobox', { name: 'Priority' }),
      'urgent',
    )
    fireEvent.change(form.getByLabelText('Due date'), {
      target: { value: '2026-12-15' },
    })
    await user.click(form.getByRole('button', { name: 'Create task' }))
    const main = await mainRegion()
    expect(
      await main.findByRole('heading', { name: 'Build the first screen' }),
    ).toBeInTheDocument()
    expect(main.getByText('Urgent', { exact: false })).toBeInTheDocument()
    expect(
      within(main.getByRole('list', { name: 'Task list' })).getByText(
        'In progress',
      ),
    ).toBeInTheDocument()
    expect((await taskRepository.getTasks())[0]).toMatchObject({
      projectId: project.id,
      status: 'in-progress',
      priority: 'urgent',
      dueDate: '2026-12-15',
    })
    await waitFor(() =>
      expect(main.getByRole('button', { name: 'New task' })).toHaveFocus(),
    )
  })

  it('defaults to the contextual project and does not show another project tasks', async () => {
    const user = userEvent.setup()
    const first = await projectRepository.createProject({ name: 'First' })
    const second = await projectRepository.createProject({ name: 'Second' })
    await createTask(first.id, 'Visible task')
    await createTask(second.id, 'Other task')
    renderTasks(`/app/projects/${first.id}`)
    const main = await mainRegion()
    expect(
      await main.findByRole('heading', { name: 'Visible task' }),
    ).toBeInTheDocument()
    expect(
      main.queryByRole('heading', { name: 'Other task' }),
    ).not.toBeInTheDocument()
    const form = await openCreate(user)
    expect(form.getByRole('combobox', { name: 'Project' })).toHaveValue(
      first.id,
    )
  })

  it('edits a task, marks it done and restores focus to its surviving trigger', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    const task = await createTask(project.id)
    renderTasks()
    const main = await mainRegion()
    const trigger = await main.findByRole('button', {
      name: 'First task',
      exact: true,
    })
    await user.click(trigger)
    const form = within(
      await screen.findByRole('dialog', { name: 'Edit task' }),
    )
    const title = form.getByRole('textbox', { name: 'Task title' })
    await user.clear(title)
    await user.type(title, 'Finished task')
    await user.selectOptions(
      form.getByRole('combobox', { name: 'Status' }),
      'done',
    )
    await user.click(form.getByRole('button', { name: 'Save task' }))
    expect(
      await main.findByRole('heading', { name: 'Finished task' }),
    ).toBeInTheDocument()
    expect((await taskRepository.getTaskById(task.id)).completedAt).toEqual(
      expect.any(String),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('requires confirmation, supports cancellation and restores focus after deletion', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    const task = await createTask(project.id)
    renderTasks()
    const main = await mainRegion()
    const trigger = await main.findByRole('button', {
      name: 'Actions for First task',
    })
    await user.click(trigger)
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete First task' }),
    )
    let dialog = within(await screen.findByRole('alertdialog'))
    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(await taskRepository.getTaskById(task.id)).toBeDefined()
    await user.click(trigger)
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete First task' }),
    )
    dialog = within(await screen.findByRole('alertdialog'))
    await user.click(dialog.getByRole('button', { name: 'Delete task' }))
    expect(
      await main.findByText('No tasks yet. Create a task to get started.'),
    ).toBeInTheDocument()
    expect(await taskRepository.getTaskById(task.id)).toBeUndefined()
    await waitFor(() =>
      expect(main.getByRole('button', { name: 'New task' })).toHaveFocus(),
    )
  })

  it('keeps a failed delete open for retry without losing the task', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    const task = await createTask(project.id)
    const spy = vi
      .spyOn(taskRepository, 'deleteTask')
      .mockRejectedValueOnce(new Error('WRITE_FAILED'))
    renderTasks()
    const main = await mainRegion()
    await user.click(
      await main.findByRole('button', { name: 'Actions for First task' }),
    )
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete First task' }),
    )
    const dialog = within(await screen.findByRole('alertdialog'))
    await user.click(dialog.getByRole('button', { name: 'Delete task' }))
    expect(await dialog.findByRole('alert')).toHaveTextContent(
      'Unable to delete the task.',
    )
    expect(await taskRepository.getTaskById(task.id)).toBeDefined()
    spy.mockRestore()
    await user.click(dialog.getByRole('button', { name: 'Delete task' }))
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
  })

  it('recovers from a task query error through retry', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    await createTask(project.id)
    const spy = vi
      .spyOn(taskRepository, 'getTasks')
      .mockRejectedValue(new Error('READ_FAILED'))
    renderTasks()
    const main = await mainRegion()
    const error = within(await main.findByRole('alert'))
    expect(
      error.getByRole('heading', { name: 'Unable to load tasks' }),
    ).toBeInTheDocument()
    expect(main.getByRole('button', { name: 'New task' })).toBeDisabled()
    spy.mockRestore()
    await user.click(error.getByRole('button', { name: 'Try again' }))
    expect(
      await main.findByRole('heading', { name: 'First task' }),
    ).toBeInTheDocument()
  })

  it('reacts to external task creation and project deletion', async () => {
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    renderTasks()
    const main = await mainRegion()
    await main.findByText('No tasks yet. Create a task to get started.')
    await act(async () => {
      await createTask(project.id, 'Created elsewhere')
    })
    expect(
      await main.findByRole('heading', { name: 'Created elsewhere' }),
    ).toBeInTheDocument()
    await act(async () => {
      await projectRepository.deleteProject(project.id)
    })
    expect(
      await main.findByText('Create a project before adding tasks.'),
    ).toBeInTheDocument()
    expect(await taskRepository.getTasks()).toEqual([])
  })

  it('retains task data after remount and renders Portuguese labels', async () => {
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    await createTask(project.id)
    const view = renderTasks()
    expect(
      await (await mainRegion()).findByRole('heading', { name: 'First task' }),
    ).toBeInTheDocument()
    view.unmount()
    await i18n.changeLanguage('pt-PT')
    renderTasks()
    const main = await mainRegion()
    expect(
      await main.findByRole('heading', { name: 'First task' }),
    ).toBeInTheDocument()
    expect(
      within(main.getByRole('list', { name: 'Lista de tarefas' })).getByText(
        'Por fazer',
      ),
    ).toBeInTheDocument()
    expect(main.getByRole('button', { name: 'Nova tarefa' })).toBeEnabled()
  })

  it('restores focus after closing creation with Escape', async () => {
    const user = userEvent.setup()
    await projectRepository.createProject({ name: 'Portfolio' })
    renderTasks()
    await openCreate(user)
    await user.keyboard('{Escape}')
    const main = await mainRegion()
    await waitFor(() =>
      expect(main.getByRole('button', { name: 'New task' })).toHaveFocus(),
    )
  })
  it('shows loading rather than an empty list while the task query is pending', async () => {
    await projectRepository.createProject({ name: 'Portfolio' })
    vi.spyOn(taskRepository, 'getTasks').mockImplementation(
      () => new Promise(() => {}),
    )
    renderTasks()
    const main = await mainRegion()
    expect(await main.findByText('Loading tasks...')).toBeInTheDocument()
    expect(
      main.queryByText('No tasks yet. Create a task to get started.'),
    ).not.toBeInTheDocument()
    expect(main.getByRole('button', { name: 'New task' })).toBeDisabled()
  })

  it('recovers from a project-options read error without enabling invalid creation', async () => {
    const user = userEvent.setup()
    await projectRepository.createProject({ name: 'Portfolio' })
    const spy = vi
      .spyOn(projectRepository, 'getProjects')
      .mockRejectedValue(new Error('READ_FAILED'))
    renderTasks()
    const main = await mainRegion()
    const error = within(await main.findByRole('alert'))
    expect(main.getByRole('button', { name: 'New task' })).toBeDisabled()
    spy.mockRestore()
    await user.click(error.getByRole('button', { name: 'Try again' }))
    expect(
      await main.findByText('No tasks yet. Create a task to get started.'),
    ).toBeInTheDocument()
    expect(main.getByRole('button', { name: 'New task' })).toBeEnabled()
  })

  it('preserves entered data after a failed save and succeeds on retry', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Portfolio' })
    const spy = vi
      .spyOn(taskRepository, 'createTask')
      .mockRejectedValueOnce(new Error('WRITE_FAILED'))
    renderTasks()
    const form = await openCreate(user)
    await user.type(
      form.getByRole('textbox', { name: 'Task title' }),
      'Keep my draft',
    )
    await user.selectOptions(
      form.getByRole('combobox', { name: 'Project' }),
      project.id,
    )
    await user.click(form.getByRole('button', { name: 'Create task' }))
    expect(await form.findByRole('alert')).toHaveTextContent(
      'Unable to save the task.',
    )
    expect(form.getByRole('textbox', { name: 'Task title' })).toHaveValue(
      'Keep my draft',
    )
    spy.mockRestore()
    await user.click(form.getByRole('button', { name: 'Create task' }))
    expect(
      await (
        await mainRegion()
      ).findByRole('heading', { name: 'Keep my draft' }),
    ).toBeInTheDocument()
  })
})

describe('Task filters integration', () => {
  it('combines search, priority and project and clears an empty result', async () => {
    const user = userEvent.setup()
    const first = await projectRepository.createProject({
      name: 'First project',
    })
    const second = await projectRepository.createProject({
      name: 'Second project',
    })
    await taskRepository.createTask({
      projectId: first.id,
      title: 'Revisão',
      description: 'Árvore',
      priority: 'high',
    })
    await taskRepository.createTask({
      projectId: second.id,
      title: 'Another',
      priority: 'low',
    })
    renderTasks()
    const main = await mainRegion()
    const search = await main.findByRole('searchbox', { name: 'Search tasks' })
    await waitFor(() => expect(search).toBeEnabled())
    await user.type(search, 'arvore')
    await user.click(main.getByRole('button', { name: 'Filters' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by priority' }),
      'high',
    )
    expect(
      main.getByRole('status', { name: 'Filtered task count' }),
    ).toHaveTextContent('1 of 2 tasks')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by project' }),
      second.id,
    )
    expect(main.getByText('No tasks match your filters.')).toBeInTheDocument()
    await user.click(main.getByRole('button', { name: 'Clear filters' }))
    expect(
      main.getByRole('status', { name: 'Filtered task count' }),
    ).toHaveTextContent('2 of 2 tasks')
    expect(search).toHaveValue('')
    expect(await taskRepository.getTasks()).toHaveLength(2)
  })

  it('sorts the rendered list without persisting a different manual order', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({ name: 'Sort QA' })
    const first = await createTask(project.id, 'Zebra')
    const second = await createTask(project.id, 'Alpha')
    renderTasks()
    const main = await mainRegion()
    const sort = await main.findByRole('button', { name: 'Sort tasks' })
    await waitFor(() => expect(sort).toBeEnabled())
    await user.click(sort)
    await user.click(screen.getByRole('menuitemradio', { name: 'Title, A–Z' }))
    expect(
      main
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['Alpha', 'Zebra'])
    expect(
      (await taskRepository.getTasks(project.id)).map((task) => task.id),
    ).toEqual([first.id, second.id])
  })

  it('shows overdue only for unfinished tasks and filters completed records out', async () => {
    const user = userEvent.setup()
    const project = await projectRepository.createProject({
      name: 'Deadline QA',
    })
    await taskRepository.createTask({
      projectId: project.id,
      title: 'Late open',
      dueDate: '2000-01-01',
    })
    await taskRepository.createTask({
      projectId: project.id,
      title: 'Past completed',
      dueDate: '2000-01-01',
      status: 'done',
    })
    renderTasks()
    const main = await mainRegion()
    const filterButton = await main.findByRole('button', { name: 'Filters' })
    await waitFor(() => expect(filterButton).toBeEnabled())
    await user.click(filterButton)
    const due = screen.getByRole('combobox', { name: 'Filter by due date' })
    const list = within(main.getByRole('list', { name: 'Task list' }))
    expect(list.getAllByText('Overdue')).toHaveLength(1)
    await user.selectOptions(due, 'overdue')
    expect(main.getByRole('heading', { name: 'Late open' })).toBeInTheDocument()
    expect(
      main.queryByRole('heading', { name: 'Past completed' }),
    ).not.toBeInTheDocument()
  })
})

it('keeps project completion independent from the filtered result', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({
    name: 'Workspace QA',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Completed',
    status: 'done',
  })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Still open',
  })
  renderTasks(`/app/projects/${project.id}`)
  const main = await mainRegion()
  const progress = await main.findByRole('progressbar', {
    name: 'Project completion',
  })
  await waitFor(() => expect(progress).toHaveAttribute('value', '50'))
  await user.type(
    main.getByRole('searchbox', { name: 'Search tasks' }),
    'Still open',
  )
  expect(
    main.getByRole('status', { name: 'Filtered task count' }),
  ).toHaveTextContent('1 of 2 tasks')
  expect(progress).toHaveAttribute('value', '50')
  expect(main.getByText('1 of 2 completed')).toBeInTheDocument()
})

it('removes one filter without resetting the chosen sort and returns popover focus', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({ name: 'Toolbar QA' })
  await taskRepository.createTask({
    projectId: project.id,
    title: 'Visible',
    priority: 'high',
  })
  renderTasks()
  const main = await mainRegion()
  const filters = await main.findByRole('button', { name: 'Filters' })
  await waitFor(() => expect(filters).toBeEnabled())
  await user.click(filters)
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filter by priority' }),
    'high',
  )
  await user.keyboard('{Escape}')
  await waitFor(() => expect(filters).toHaveFocus())
  await user.click(main.getByRole('button', { name: 'Sort tasks' }))
  await user.click(screen.getByRole('menuitemradio', { name: 'Title, A–Z' }))
  await user.click(
    main.getByRole('button', {
      name: 'Remove filter: Filter by priority: High',
    }),
  )
  expect(filters).not.toHaveTextContent('1')
  await user.click(main.getByRole('button', { name: 'Sort tasks' }))
  expect(
    screen.getByRole('menuitemradio', { name: 'Title, A–Z' }),
  ).toHaveAttribute('aria-checked', 'true')
})

it('edits the project from its workspace and returns focus to the actions trigger', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({
    name: 'Header actions',
  })
  renderTasks(`/app/projects/${project.id}`)
  const main = await mainRegion()
  const trigger = await main.findByRole('button', {
    name: 'Actions for Header actions',
  })
  await user.click(trigger)
  await user.click(screen.getByRole('menuitem', { name: 'Edit project' }))
  const dialog = within(
    await screen.findByRole('dialog', { name: 'Edit project' }),
  )
  await user.type(
    dialog.getByRole('textbox', { name: 'Description' }),
    'Updated through the workspace',
  )
  await user.click(dialog.getByRole('button', { name: 'Save changes' }))
  expect(
    await main.findByText('Updated through the workspace'),
  ).toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('preserves the workspace when project deletion is cancelled and navigates after confirmed deletion', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({
    name: 'Delete header QA',
  })
  const task = await createTask(project.id)
  const { router } = renderTasks(`/app/projects/${project.id}`)
  const main = await mainRegion()
  const trigger = await main.findByRole('button', {
    name: 'Actions for Delete header QA',
  })
  await user.click(trigger)
  await user.click(screen.getByRole('menuitem', { name: 'Delete project' }))
  await user.click(
    within(await screen.findByRole('alertdialog')).getByRole('button', {
      name: 'Cancel',
    }),
  )
  await waitFor(() => expect(trigger).toHaveFocus())
  expect(await taskRepository.getTaskById(task.id)).toBeDefined()
  await user.click(trigger)
  await user.click(screen.getByRole('menuitem', { name: 'Delete project' }))
  await user.click(
    within(await screen.findByRole('alertdialog')).getByRole('button', {
      name: 'Delete project',
    }),
  )
  await waitFor(() =>
    expect(router.state.location.pathname).toBe('/app/projects'),
  )
  expect(await projectRepository.getProjectById(project.id)).toBeUndefined()
  expect(await taskRepository.getTaskById(task.id)).toBeUndefined()
})

it('creates from a column with its status and restores the column trigger', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({
    name: 'Column creation',
  })
  renderTasks(`/app/projects/${project.id}`)
  const trigger = await screen.findByRole('button', {
    name: 'Add task to In progress',
  })
  await user.click(trigger)
  const form = within(
    await screen.findByRole('dialog', { name: 'Create task' }),
  )
  expect(form.getByRole('combobox', { name: 'Status' })).toHaveValue(
    'in-progress',
  )
  await user.type(
    form.getByRole('textbox', { name: 'Task title' }),
    'Column task',
  )
  await user.click(form.getByRole('button', { name: 'Create task' }))
  await screen.findByRole('heading', { name: 'Column task' })
  expect((await taskRepository.getTasks(project.id))[0].status).toBe(
    'in-progress',
  )
  await waitFor(() => expect(trigger).toHaveFocus())
})
