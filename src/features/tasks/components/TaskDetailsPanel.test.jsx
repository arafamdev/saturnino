import 'fake-indexeddb/auto'

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { BEFORE_PWA_UPDATE } from '@/features/pwa/events/updateGuard'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { database } from '@/lib/db/database'

import { taskRepository } from '../services/taskRepository'

let task
beforeEach(async () => {
  localStorage.clear()
  await database.tasks.clear()
  await database.projects.clear()
  const project = await projectRepository.createProject({ name: 'Panel QA' })
  task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Review draft',
    description: 'Original description',
  })
})
afterEach(() => vi.restoreAllMocks())

async function openPanel() {
  const user = userEvent.setup()
  const router = createMemoryRouter(routes, { initialEntries: ['/app/tasks'] })
  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
  const trigger = await screen.findByRole('button', {
    name: task.title,
    exact: true,
  })
  await user.click(trigger)
  const panel = within(await screen.findByRole('dialog', { name: 'Edit task' }))
  return { user, router, trigger, panel }
}

it('protects Escape and Cancel, keeps a draft and discards without saving', async () => {
  const { user, trigger, panel } = await openPanel()
  const title = panel.getByRole('textbox', { name: 'Task title' })
  await user.clear(title)
  await user.type(title, 'Unsaved title')
  await user.keyboard('{Escape}')
  let confirmation = within(await screen.findByRole('alertdialog'))
  await user.click(
    confirmation.getByRole('button', { name: 'Continue editing' }),
  )
  expect(title).toHaveValue('Unsaved title')
  await waitFor(() => expect(title).toHaveFocus())
  await user.click(panel.getByRole('button', { name: 'Cancel' }))
  confirmation = within(await screen.findByRole('alertdialog'))
  await user.click(
    confirmation.getByRole('button', { name: 'Discard changes' }),
  )
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect((await taskRepository.getTaskById(task.id)).title).toBe('Review draft')
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('closes a clean panel without a discard prompt, including changes reverted to defaults', async () => {
  const { user, panel } = await openPanel()
  const title = panel.getByRole('textbox', { name: 'Task title' })
  await user.type(title, ' changed')
  await user.clear(title)
  await user.type(title, task.title)
  await user.click(panel.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
})

it('blocks route navigation until the user discards the draft', async () => {
  const { user, panel, router } = await openPanel()
  await user.type(
    panel.getByRole('textbox', { name: 'Description' }),
    ' unsaved',
  )
  await act(async () => {
    await router.navigate('/app/projects')
  })
  await screen.findByRole('alertdialog')
  await user.click(screen.getByRole('button', { name: 'Continue editing' }))
  expect(router.state.location.pathname).toBe('/app/tasks')
  expect(panel.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Original description unsaved',
  )
  await act(async () => {
    await router.navigate('/app/projects')
  })
  await user.click(
    await screen.findByRole('button', { name: 'Discard changes' }),
  )
  await waitFor(() =>
    expect(router.state.location.pathname).toBe('/app/projects'),
  )
})

it('guards native reloads and explicit PWA updates without activating them prematurely', async () => {
  const { user, panel } = await openPanel()
  await user.type(
    panel.getByRole('textbox', { name: 'Task title' }),
    ' unsaved',
  )
  const unload = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(unload)
  expect(unload.defaultPrevented).toBe(true)
  const proceed = vi.fn()
  let allowed
  act(() => {
    allowed = window.dispatchEvent(
      new CustomEvent(BEFORE_PWA_UPDATE, {
        cancelable: true,
        detail: { proceed },
      }),
    )
  })
  expect(allowed).toBe(false)
  await user.click(
    await screen.findByRole('button', { name: 'Continue editing' }),
  )
  expect(proceed).not.toHaveBeenCalled()
  act(() => {
    window.dispatchEvent(
      new CustomEvent(BEFORE_PWA_UPDATE, {
        cancelable: true,
        detail: { proceed },
      }),
    )
  })
  await user.click(
    await screen.findByRole('button', { name: 'Discard changes' }),
  )
  expect(proceed).toHaveBeenCalledOnce()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('retains a failed save and allows retry with the same draft', async () => {
  const { user, panel } = await openPanel()
  const spy = vi
    .spyOn(taskRepository, 'updateTask')
    .mockRejectedValueOnce(new Error('WRITE_FAILED'))
  const title = panel.getByRole('textbox', { name: 'Task title' })
  await user.clear(title)
  await user.type(title, 'Retry draft')
  await user.click(panel.getByRole('button', { name: 'Save task' }))
  expect(await panel.findByRole('alert')).toHaveTextContent('Unable to save')
  await waitFor(() => expect(panel.getByRole('alert')).toHaveFocus())
  expect(title).toHaveValue('Retry draft')
  expect((await taskRepository.getTaskById(task.id)).title).toBe(task.title)
  await user.click(panel.getByRole('button', { name: 'Save task' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect((await taskRepository.getTaskById(task.id)).title).toBe('Retry draft')
  expect(spy).toHaveBeenLastCalledWith(
    task.id,
    expect.objectContaining({ title: 'Retry draft' }),
    { expectedUpdatedAt: task.updatedAt },
  )
})

it('preserves a draft when another editor changes the task and rejects overwriting it', async () => {
  const { user, panel } = await openPanel()
  await user.type(
    panel.getByRole('textbox', { name: 'Description' }),
    ' my draft',
  )
  await act(async () => {
    await taskRepository.updateTask(task.id, { ...task, title: 'Other editor' })
  })
  expect(await panel.findByRole('status')).toHaveTextContent(
    'changed elsewhere',
  )
  await user.click(panel.getByRole('button', { name: 'Save task' }))
  expect(await panel.findByRole('alert')).toHaveTextContent(
    'draft was preserved',
  )
  expect(panel.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Original description my draft',
  )
  expect((await taskRepository.getTaskById(task.id)).title).toBe('Other editor')
})

it('retains the draft and reports when the task is removed elsewhere', async () => {
  const { user, panel } = await openPanel()
  await user.type(
    panel.getByRole('textbox', { name: 'Description' }),
    ' my draft',
  )
  await act(async () => {
    await taskRepository.deleteTask(task.id)
  })
  expect(await panel.findByRole('status')).toHaveTextContent(
    'removed elsewhere',
  )
  await user.click(panel.getByRole('button', { name: 'Save task' }))
  expect(await panel.findByRole('alert')).toBeInTheDocument()
  expect(panel.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Original description my draft',
  )
  expect(await taskRepository.getTaskById(task.id)).toBeUndefined()
})

it('cancels deletion without losing the draft, then deletes only after confirmation', async () => {
  const { user, panel } = await openPanel()
  await user.type(
    panel.getByRole('textbox', { name: 'Description' }),
    ' my draft',
  )
  await user.click(panel.getByRole('button', { name: 'Delete task' }))
  let confirmation = within(await screen.findByRole('alertdialog'))
  await user.click(confirmation.getByRole('button', { name: 'Cancel' }))
  expect(panel.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Original description my draft',
  )
  await user.click(panel.getByRole('button', { name: 'Delete task' }))
  confirmation = within(await screen.findByRole('alertdialog'))
  await user.click(confirmation.getByRole('button', { name: 'Delete task' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(await taskRepository.getTaskById(task.id)).toBeUndefined()
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'New task' })).toHaveFocus(),
  )
})
