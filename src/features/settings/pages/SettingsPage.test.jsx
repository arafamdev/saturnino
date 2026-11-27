import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ThemeProvider from '@/app/providers/theme/ThemeProvider'
import PwaProvider from '@/features/pwa/context/PwaProvider'
import { routes } from '@/app/router'
import { database } from '@/lib/db/database'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/languages'
import i18n from '@/i18n'
import { selectOption } from '@/test/selectOption'

function renderSettings() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/settings'],
  })
  return render(
    <ThemeProvider>
      <PwaProvider>
        <RouterProvider router={router} />
      </PwaProvider>
    </ThemeProvider>,
  )
}
async function mainRegion() {
  const main = within(await screen.findByRole('main'))
  await main.findByRole('heading', { name: 'Settings', level: 1 })
  return main
}
beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('en')
  await database.tasks.clear()
  await database.projects.clear()
})
afterEach(() => vi.restoreAllMocks())

it('synchronizes explicit theme selection with the header and restores it on remount', async () => {
  const user = userEvent.setup()
  const view = renderSettings()
  const main = await mainRegion()
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Color theme' }),
    'Light',
  )
  expect(document.documentElement).not.toHaveClass('dark')
  expect(localStorage.getItem('saturnino-theme')).toBe('light')
  expect(
    screen.getByRole('button', { name: 'Switch to dark mode' }),
  ).toBeInTheDocument()
  expect(
    main.getByRole('status', { name: 'Preference feedback' }),
  ).toHaveTextContent('Preferences applied.')
  view.unmount()
  renderSettings()
  expect(
    (await mainRegion()).getByRole('combobox', { name: 'Color theme' }),
  ).toHaveTextContent('Light')
  await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
  expect(
    (await mainRegion()).getByRole('combobox', { name: 'Color theme' }),
  ).toHaveTextContent('Dark')
})

it('changes language through the same i18next state used by the header', async () => {
  const user = userEvent.setup()
  renderSettings()
  const main = await mainRegion()
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Display language' }),
    'Português',
  )
  expect(
    await main.findByRole('heading', { name: 'Definições', level: 1 }),
  ).toBeInTheDocument()
  expect(
    main.getByRole('combobox', { name: 'Idioma da interface' }),
  ).toHaveTextContent('Português')
  expect(document.documentElement).toHaveAttribute('lang', 'pt-PT')
  expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pt-PT')
  expect(
    screen.getByRole('button', { name: 'Português', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

it('updates width and compact preferences without touching project records', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({ name: 'Settings QA' })
  renderSettings()
  const main = await mainRegion()
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Sidebar width on desktop' }),
    '320 px',
  )
  await user.click(main.getByRole('checkbox', { name: 'Compact sidebar' }))
  const stored = JSON.parse(
    localStorage.getItem('saturnino:sidebar-preferences'),
  )
  expect(stored).toMatchObject({ width: 320, compact: true })
  expect(await projectRepository.getProjectById(project.id)).toEqual(project)
})

it('reuses sidebar section customization and resets preferences only', async () => {
  const user = userEvent.setup()
  const project = await projectRepository.createProject({
    name: 'Keep this project',
  })
  renderSettings()
  const main = await mainRegion()
  await user.click(main.getByRole('button', { name: 'Customize sidebar' }))
  await user.click(
    main.getByRole('checkbox', { name: 'Favorites', exact: true }),
  )
  expect(
    JSON.parse(localStorage.getItem('saturnino:sidebar-preferences'))
      .hiddenSections,
  ).toContain('favorites')
  await user.click(
    main.getByRole('button', { name: 'Reset sidebar preferences' }),
  )
  expect(
    JSON.parse(localStorage.getItem('saturnino:sidebar-preferences')),
  ).toMatchObject({
    width: 256,
    compact: false,
    hiddenSections: [],
    recentProjectIds: [],
  })
  expect(await projectRepository.getProjectById(project.id)).toEqual(project)
})

it('keeps preferences usable when localStorage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('STORAGE_BLOCKED')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('STORAGE_BLOCKED')
  })
  const user = userEvent.setup()
  renderSettings()
  const main = await mainRegion()
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Color theme' }),
    'Light',
  )
  expect(document.documentElement).not.toHaveClass('dark')
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Display language' }),
    'Português',
  )
  expect(
    await main.findByRole('heading', { name: 'Definições' }),
  ).toBeInTheDocument()
})

it('explains a language failure and allows another attempt', async () => {
  const user = userEvent.setup()
  renderSettings()
  const main = await mainRegion()
  const spy = vi
    .spyOn(i18n, 'changeLanguage')
    .mockRejectedValueOnce(new Error('LANGUAGE_FAILED'))
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Display language' }),
    'Português',
  )
  expect(await main.findByRole('alert')).toHaveTextContent(
    'Could not change the language',
  )
  spy.mockRestore()
  await selectOption(
    user,
    main.getByRole('combobox', { name: 'Display language' }),
    'Português',
  )
  await waitFor(() =>
    expect(
      main.getByRole('combobox', { name: 'Idioma da interface' }),
    ).toHaveTextContent('Português'),
  )
  expect(main.queryByRole('alert')).not.toBeInTheDocument()
})
