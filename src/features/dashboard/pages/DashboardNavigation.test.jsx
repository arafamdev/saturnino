import 'fake-indexeddb/auto'

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, expect, it } from 'vitest'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import i18n from '@/i18n'
import { database } from '@/lib/db/database'

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('en')
  await database.tasks.clear()
  await database.projects.clear()
})

async function seed() {
  const first = await projectRepository.createProject({ name: 'North project' })
  const second = await projectRepository.createProject({
    name: 'South project',
  })
  await taskRepository.createTask({
    projectId: first.id,
    title: 'Late urgent task',
    priority: 'urgent',
    dueDate: '2000-01-01',
  })
  await taskRepository.createTask({
    projectId: first.id,
    title: 'Finished task',
    status: 'done',
  })
  await taskRepository.createTask({
    projectId: second.id,
    title: 'Other project task',
    status: 'backlog',
    priority: 'low',
  })
  return { first, second }
}

function open(path = '/app') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
  return router
}

it('opens the exact overdue list from the dashboard, clears filters and returns with Back', async () => {
  await seed()
  const user = userEvent.setup()
  const router = open()
  const main = within(await screen.findByRole('main'))
  await user.click(
    await main.findByRole('link', { name: 'Overdue tasks', exact: true }),
  )
  expect(
    await main.findByRole('heading', { name: 'Late urgent task', exact: true }),
  ).toBeInTheDocument()
  expect(
    main.queryByRole('heading', { name: 'Finished task' }),
  ).not.toBeInTheDocument()
  expect(
    main.queryByRole('heading', { name: 'Other project task' }),
  ).not.toBeInTheDocument()
  expect(router.state.location.search).toBe('?due=overdue')
  await user.click(main.getByRole('button', { name: 'Clear filters' }))
  expect(
    await main.findByRole('heading', { name: 'Finished task' }),
  ).toBeInTheDocument()
  expect(router.state.location.search).toBe('')
  await act(() => router.navigate(-1))
  expect(
    await main.findByRole('heading', { name: 'Overview', exact: true }),
  ).toBeInTheDocument()
})

it('keeps status and priority links actionable without mutating records', async () => {
  await seed()
  const user = userEvent.setup()
  const router = open()
  const main = within(await screen.findByRole('main'))
  await user.click(await main.findByRole('link', { name: /^Urgent/ }))
  expect(
    await main.findByRole('heading', { name: 'Late urgent task' }),
  ).toBeInTheDocument()
  expect(
    main.queryByRole('heading', { name: 'Finished task' }),
  ).not.toBeInTheDocument()
  expect(router.state.location.search).toBe('?priority=urgent')
  await act(() => router.navigate('/app'))
  await user.click(await main.findByRole('link', { name: /^Done/ }))
  expect(
    await main.findByRole('heading', { name: 'Finished task' }),
  ).toBeInTheDocument()
  expect(
    main.queryByRole('heading', { name: 'Late urgent task' }),
  ).not.toBeInTheDocument()
  expect(
    (await taskRepository.getTasks()).find(
      (task) => task.title === 'Late urgent task',
    ).status,
  ).toBe('todo')
})

it('reacts to URL changes on the same collection and ignores foreign project scope', async () => {
  const { first, second } = await seed()
  const router = open('/app/tasks?priority=urgent')
  const main = within(await screen.findByRole('main'))
  expect(
    await main.findByRole('heading', { name: 'Late urgent task' }),
  ).toBeInTheDocument()
  await act(() => router.navigate('/app/tasks?status=done'))
  expect(
    await main.findByRole('heading', { name: 'Finished task' }),
  ).toBeInTheDocument()
  expect(
    main.queryByRole('heading', { name: 'Late urgent task' }),
  ).not.toBeInTheDocument()
  await act(() =>
    router.navigate(
      `/app/projects/${first.id}?projectId=${second.id}&status=todo`,
    ),
  )
  expect(
    await main.findByRole('heading', { name: 'Late urgent task' }),
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(
      main.queryByRole('heading', { name: 'Finished task' }),
    ).not.toBeInTheDocument(),
  )
  expect(
    main.queryByRole('heading', { name: 'Other project task' }),
  ).not.toBeInTheDocument()
})
