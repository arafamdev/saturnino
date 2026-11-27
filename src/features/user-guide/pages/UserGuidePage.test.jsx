import 'fake-indexeddb/auto'

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import { routes } from '@/app/router'
import PwaProvider from '@/features/pwa/context/PwaProvider'
import { database } from '@/lib/db/database'
import i18n from '@/i18n'
import en from '../data/en.json'
import pt from '../data/pt-PT.json'
import { chapters, chapterPath } from '../data/chapters'

function mount(path = '/guide') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const view = render(
    <ThemeProvider>
      <PwaProvider enabled={false}>
        <RouterProvider router={router} />
      </PwaProvider>
    </ThemeProvider>,
  )
  return { router, ...view }
}

beforeEach(async () => {
  localStorage.clear()
  await database.tasks.clear()
  await database.projects.clear()
})

afterEach(() => vi.unstubAllGlobals())

it('does not offer installation in a standalone window', async () => {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: query === '(display-mode: standalone)',
    addEventListener() {},
    removeEventListener() {},
  }))
  mount('/guide/installation')
  expect(await screen.findByText(en.installed)).toBeVisible()
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = vi.fn()
  await act(async () => window.dispatchEvent(event))
  expect(
    screen.queryByRole('button', { name: 'Install Saturnino' }),
  ).not.toBeInTheDocument()
  expect(event.prompt).not.toHaveBeenCalled()
})

it.each(chapters)(
  'opens the $id chapter directly with its English and Portuguese content',
  async ({ id }) => {
    mount(chapterPath(id))
    expect(
      await screen.findByRole('heading', {
        name: en.chapters[id].title,
        level: 1,
      }),
    ).toBeVisible()
    await act(() => i18n.changeLanguage('pt-PT'))
    expect(
      await screen.findByRole('heading', {
        name: pt.chapters[id].title,
        level: 1,
      }),
    ).toBeVisible()
    expect(screen.getByText(pt.chapters[id].intro)).toBeInTheDocument()
  },
)

it('navigates chapters, marks the active page, focuses headings and closes the compact menu', async () => {
  const user = userEvent.setup()
  const { router } = mount()
  await screen.findByRole('heading', { name: 'Introduction', level: 1 })
  const menu = screen.getByText('Browse chapters').closest('details')
  await user.click(screen.getByText('Browse chapters'))
  expect(menu).toHaveAttribute('open')
  await user.click(within(menu).getByRole('link', { name: '02 Quick Start' }))
  const heading = await screen.findByRole('heading', {
    name: 'Quick Start',
    level: 1,
  })
  await waitFor(() => expect(heading).toHaveFocus())
  expect(menu).not.toHaveAttribute('open')
  expect(router.state.location.pathname).toBe('/guide/quick-start')
  expect(
    screen.getAllByRole('link', { name: '02 Quick Start' })[0],
  ).toHaveAttribute('aria-current', 'page')
  await user.click(
    screen.getByRole('link', { name: 'Next chapter Installation' }),
  )
  expect(
    await screen.findByRole('heading', { name: 'Installation', level: 1 }),
  ).toBeVisible()
})

it('supports direct section focus and a safe unknown chapter state', async () => {
  const { router } = mount('/guide/backup#restore')
  await screen.findByRole('heading', { name: 'Backup & Restore', level: 1 })
  await waitFor(() => expect(document.getElementById('restore')).toHaveFocus())
  await act(() => router.navigate('/guide/missing'))
  expect(
    await screen.findByRole('heading', { name: 'Chapter not found', level: 1 }),
  ).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Return to workspace' }),
  ).toHaveAttribute('href', '/app')
})

it('offers the guide before About in public navigation and from Settings without altering data', async () => {
  const user = userEvent.setup()
  mount('/app/settings')
  await screen.findByRole('heading', { name: 'Settings', level: 1 })
  const help = screen.getByRole('region', { name: 'Help & Support' })
  await user.click(within(help).getByRole('link', { name: 'User Guide' }))
  await screen.findByRole('heading', { name: 'Introduction', level: 1 })
  const links = within(
    screen.getByRole('navigation', { name: 'Public navigation' }),
  ).getAllByRole('link')
  expect(links.slice(0, 2).map((x) => x.textContent)).toEqual([
    'User Guide',
    'About',
  ])
  await user.click(screen.getByRole('link', { name: 'Return to workspace' }))
  expect(
    await screen.findByRole('heading', { name: 'Overview', level: 1 }),
  ).toBeVisible()
  expect(await database.projects.count()).toBe(0)
  expect(await database.tasks.count()).toBe(0)
})

it('expands FAQ with keyboard and exposes practical answers', async () => {
  const user = userEvent.setup()
  mount('/guide/faq')
  const question = await screen.findByRole('button', {
    name: 'Can I use the same projects on several devices?',
  })
  question.focus()
  await user.keyboard('{Enter}')
  expect(question).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(en.faq[7].answer)).toBeVisible()
  await user.keyboard('{Enter}')
  expect(question).toHaveAttribute('aria-expanded', 'false')
})

it('offers platform instructions without claiming a service worker implies an install button', async () => {
  mount('/guide/installation')
  expect(
    await screen.findByRole('heading', { name: 'iPhone · Safari' }),
  ).toBeVisible()
  expect(screen.getByRole('heading', { name: 'iPad · Safari' })).toBeVisible()
  expect(
    screen.getByRole('heading', { name: 'Windows · Edge or Chrome' }),
  ).toBeVisible()
  expect(screen.getByText(en.manual)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Install Saturnino' }),
  ).not.toBeInTheDocument()
})

it('only prompts a real available installation event once, handles dismissal and appinstalled', async () => {
  const user = userEvent.setup()
  const { unmount } = mount('/guide/installation')
  await screen.findByRole('heading', { name: 'Installation', level: 1 })
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = vi.fn().mockResolvedValue({ outcome: 'dismissed' })
  await act(async () => window.dispatchEvent(event))
  expect(event.defaultPrevented).toBe(true)
  await user.click(screen.getByRole('button', { name: 'Install Saturnino' }))
  expect(event.prompt).toHaveBeenCalledTimes(1)
  expect(await screen.findByText(en.installDismissed)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Install Saturnino' }),
  ).not.toBeInTheDocument()
  const next = new Event('beforeinstallprompt', { cancelable: true })
  next.prompt = vi.fn().mockRejectedValue(new Error('Unavailable'))
  await act(async () => window.dispatchEvent(next))
  await user.click(screen.getByRole('button', { name: 'Install Saturnino' }))
  expect(await screen.findByText(en.installFailed)).toBeVisible()
  await act(async () => window.dispatchEvent(new Event('appinstalled')))
  expect(screen.getByText(en.installed)).toBeVisible()
  unmount()
  const after = new Event('beforeinstallprompt', { cancelable: true })
  after.prompt = vi.fn()
  window.dispatchEvent(after)
  expect(after.defaultPrevented).toBe(false)
})

it('accepts the browser userChoice promise and keeps installation user driven', async () => {
  const user = userEvent.setup()
  mount('/guide/installation')
  await screen.findByRole('heading', { name: 'Installation', level: 1 })
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'accepted' })
  await act(async () => window.dispatchEvent(event))
  expect(event.prompt).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Install Saturnino' }))
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Install Saturnino' }),
    ).not.toBeInTheDocument(),
  )
  expect(screen.queryByText(en.installFailed)).not.toBeInTheDocument()
  expect(screen.queryByText(en.installed)).not.toBeInTheDocument()
})
