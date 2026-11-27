import 'fake-indexeddb/auto'

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { createAppRouter } from '@/app/router'
import PwaProvider from '@/features/pwa/context/PwaProvider'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import { database } from '@/lib/db/database'
import i18n from '@/i18n'

import { NAVIGATION_STORAGE_KEY } from './navigationHistory'

let routers = []
let project

function mountRouter() {
  const router = createAppRouter()
  routers.push(router)
  const view = render(
    <ThemeProvider>
      <PwaProvider>
        <RouterProvider router={router} />
      </PwaProvider>
    </ThemeProvider>,
  )
  return { router, view }
}

async function visit(router, path, options) {
  await act(async () => {
    await router.navigate(path, options)
  })
  await waitFor(() =>
    expect(
      `${router.state.location.pathname}${router.state.location.search}`,
    ).toBe(path),
  )
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Go back', exact: true }),
    ).toBeVisible(),
  )
}

async function expectPath(router, path) {
  await waitFor(() =>
    expect(
      `${router.state.location.pathname}${router.state.location.search}`,
    ).toBe(path),
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
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/app')
  await database.tasks.clear()
  await database.projects.clear()
  project = await projectRepository.createProject({ name: 'Navigation QA' })
})

afterEach(() => {
  for (const router of routers) router.dispose()
  routers = []
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('returns through consecutive application pages using the real browser router', async () => {
  const user = userEvent.setup()
  const { router } = mountRouter()
  expect(await screen.findByRole('button', { name: 'Go back' })).toBeDisabled()
  await visit(router, '/app/projects')
  await visit(router, `/app/projects/${project.id}`)
  await visit(router, '/app/tasks')
  const length = window.history.length
  await user.click(screen.getByRole('button', { name: 'Go back' }))
  await expectPath(router, `/app/projects/${project.id}`)
  await user.click(screen.getByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app/projects')
  await user.click(screen.getByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app')
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Go back' })).toBeDisabled(),
  )
  expect(window.history.length).toBe(length)
})

it('uses replace fallback after direct access and never traverses unknown earlier history', async () => {
  window.history.replaceState(null, '', '/app/tasks?priority=high')
  const { router } = mountRouter()
  const go = vi.spyOn(window.history, 'go')
  const length = window.history.length
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app')
  expect(go).not.toHaveBeenCalled()
  expect(window.history.length).toBe(length)
  expect(screen.getByRole('button', { name: 'Go back' })).toBeDisabled()
})

it('restores known internal history after a reload-equivalent router remount', async () => {
  const user = userEvent.setup()
  let mounted = mountRouter()
  await screen.findByRole('button', { name: 'Go back' })
  await visit(mounted.router, '/app/projects')
  await visit(mounted.router, '/app/settings')
  mounted.view.unmount()
  mounted.router.dispose()
  mounted = mountRouter()
  await user.click(await screen.findByRole('button', { name: 'Go back' }))
  await expectPath(mounted.router, '/app/projects')
  await user.click(screen.getByRole('button', { name: 'Go back' }))
  await expectPath(mounted.router, '/app')
})

it('preserves query replacement and native Back/Forward without new entries', async () => {
  const { router } = mountRouter()
  await screen.findByRole('button', { name: 'Go back' })
  await visit(router, '/app/tasks?due=overdue')
  await visit(router, '/app/tasks?priority=high', {
    replace: true,
    preventScrollReset: true,
  })
  await visit(router, '/app/settings')
  const length = window.history.length
  await act(async () => {
    await router.navigate(-1)
  })
  await expectPath(router, '/app/tasks?priority=high')
  await act(async () => {
    await router.navigate(1)
  })
  await expectPath(router, '/app/settings')
  await userEvent.click(screen.getByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app/tasks?priority=high')
  expect(window.history.length).toBe(length)
})

it('rejects an external saved predecessor and treats a public route as a fallback boundary', async () => {
  window.history.replaceState({ idx: 4, key: 'current' }, '', '/app/tasks')
  sessionStorage.setItem(
    NAVIGATION_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      entries: [
        { index: 3, key: 'external', url: 'https://example.com/' },
        { index: 4, key: 'current', url: '/app/tasks' },
      ],
    }),
  )
  const { router } = mountRouter()
  const go = vi.spyOn(window.history, 'go')
  await userEvent.click(await screen.findByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app')
  expect(go).not.toHaveBeenCalled()
  await act(async () => {
    await router.navigate('/about')
  })
  await act(async () => {
    await router.navigate('/app/tasks')
  })
  await userEvent.click(await screen.findByRole('button', { name: 'Go back' }))
  await expectPath(router, '/app')
  expect(go).not.toHaveBeenCalled()
})

it('keeps dirty task drafts and journal unchanged until blocked POP is confirmed', async () => {
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Keep draft',
  })
  const user = userEvent.setup()
  const { router } = mountRouter()
  await screen.findByRole('button', { name: 'Go back' })
  await visit(router, '/app/projects')
  await visit(router, '/app/tasks')
  await user.click(
    await screen.findByRole('button', { name: task.title, exact: true }),
  )
  const panel = within(await screen.findByRole('dialog', { name: 'Edit task' }))
  await user.type(
    panel.getByRole('textbox', { name: 'Description' }),
    'Unsaved navigation draft',
  )
  const saved = sessionStorage.getItem(NAVIGATION_STORAGE_KEY)
  // The modal covers the header; native Back uses the same Router POP path.
  await act(async () => {
    await router.navigate(-1)
  })
  let prompt = within(await screen.findByRole('alertdialog'))
  expect(router.state.location.pathname).toBe('/app/tasks')
  expect(sessionStorage.getItem(NAVIGATION_STORAGE_KEY)).toBe(saved)
  await user.click(prompt.getByRole('button', { name: 'Continue editing' }))
  expect(panel.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Unsaved navigation draft',
  )
  await act(async () => {
    await router.navigate(-1)
  })
  prompt = within(await screen.findByRole('alertdialog'))
  await user.click(prompt.getByRole('button', { name: 'Discard changes' }))
  await expectPath(router, '/app/projects')
  expect((await taskRepository.getTaskById(task.id)).description).toBe('')
})

it('supports Portuguese labels, keyboard activation and an accessible tooltip', async () => {
  const user = userEvent.setup()
  const { router } = mountRouter()
  await screen.findByRole('button', { name: 'Go back' })
  await visit(router, '/app/projects')
  await visit(router, '/app/settings')
  await act(async () => {
    await i18n.changeLanguage('pt-PT')
  })
  const button = screen.getByRole('button', { name: 'Voltar', exact: true })
  await user.hover(button)
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Voltar')
  button.focus()
  await user.keyboard('{Enter}')
  await expectPath(router, '/app/projects')
})
