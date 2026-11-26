import 'fake-indexeddb/auto'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { database } from '@/lib/db/database'
import { workspaceRepository } from '@/lib/db/workspaceRepository'
import { projectRepository } from '@/features/projects/services/projectRepository'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  MAX_BACKUP_BYTES,
  parseBackup,
} from '../services/backupFormat'
import { dataManagementRepository } from '../services/dataManagementRepository'
import * as localFiles from '../services/localFiles'
import DataManagementPanel from './DataManagementPanel'

let original, incoming
beforeEach(async () => {
  await database.tasks.clear()
  await database.projects.clear()
  const project = await projectRepository.createProject({ name: 'Current QA' })
  const task = await taskRepository.createTask({
    projectId: project.id,
    title: 'Current task',
  })
  original = await workspaceRepository.getSnapshot()
  const nextProject = {
    ...project,
    id: crypto.randomUUID(),
    name: 'Imported QA',
    isFavorite: true,
  }
  incoming = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    projects: [nextProject],
    tasks: [
      {
        ...task,
        id: crypto.randomUUID(),
        projectId: nextProject.id,
        title: 'Imported task',
      },
    ],
  }
  vi.spyOn(localFiles, 'downloadTextFile').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())
async function ready() {
  render(<DataManagementPanel />)
  const button = await screen.findByRole('button', {
    name: 'Restore JSON backup',
  })
  await waitFor(() => expect(button).toBeEnabled())
  return button
}
function file(value = incoming) {
  return new File([JSON.stringify(value)], 'qa-backup.json', {
    type: 'application/json',
  })
}
async function preview(user) {
  await user.upload(screen.getByLabelText('Choose a JSON backup'), file())
  return within(
    await screen.findByRole('alertdialog', {
      name: 'Replace local workspace?',
    }),
  )
}

it('prepares a round-trippable JSON download and task CSV without changing records', async () => {
  const user = userEvent.setup()
  await ready()
  await user.click(screen.getByRole('button', { name: 'Download JSON backup' }))
  await waitFor(() =>
    expect(localFiles.downloadTextFile).toHaveBeenCalledTimes(1),
  )
  const [text, type, filename] = localFiles.downloadTextFile.mock.calls[0]
  expect(parseBackup(text)).toMatchObject(original)
  expect(type).toContain('application/json')
  expect(filename).toMatch(/^saturnino-backup-.*\.json$/)
  await user.click(screen.getByRole('button', { name: 'Export tasks as CSV' }))
  await waitFor(() =>
    expect(localFiles.downloadTextFile).toHaveBeenCalledTimes(2),
  )
  expect(localFiles.downloadTextFile.mock.calls[1][0]).toContain(
    '"Current task"',
  )
  expect(await workspaceRepository.getSnapshot()).toEqual(original)
})
it('previews and cancels without writing, then restores focus to the import button', async () => {
  const user = userEvent.setup()
  const button = await ready()
  const dialog = await preview(user)
  expect(dialog.getByText('Selected backup')).toBeInTheDocument()
  expect(
    dialog.getByText(/Existing records not in the backup will be removed/),
  ).toBeInTheDocument()
  expect(await workspaceRepository.getSnapshot()).toEqual(original)
  await user.click(dialog.getByRole('button', { name: 'Cancel' }))
  await waitFor(() => expect(button).toHaveFocus())
  expect(await workspaceRepository.getSnapshot()).toEqual(original)
})
it('restores only after explicit confirmation and updates the live counts', async () => {
  const user = userEvent.setup()
  await ready()
  const dialog = await preview(user)
  await user.click(dialog.getByRole('button', { name: 'Replace workspace' }))
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
  )
  expect(await workspaceRepository.getSnapshot()).toEqual({
    projects: incoming.projects,
    tasks: incoming.tasks,
  })
  expect(
    screen.getByRole('status', { name: 'Data management feedback' }),
  ).toHaveTextContent('Workspace restored.')
})
it('rejects malformed content and oversized files before any restore', async () => {
  const user = userEvent.setup()
  await ready()
  await user.upload(
    screen.getByLabelText('Choose a JSON backup'),
    file({ wrong: true }),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'not a valid Saturnino backup',
  )
  const oversized = file()
  vi.spyOn(oversized, 'size', 'get').mockReturnValue(MAX_BACKUP_BYTES + 1)
  await user.upload(screen.getByLabelText('Choose a JSON backup'), oversized)
  expect(await screen.findByRole('alert')).toHaveTextContent('20 MiB')
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(await workspaceRepository.getSnapshot()).toEqual(original)
})
it('keeps the dialog and original records on write failure, then retries safely', async () => {
  const user = userEvent.setup()
  await ready()
  vi.spyOn(dataManagementRepository, 'restoreBackup').mockRejectedValueOnce(
    new Error('WRITE_FAILED'),
  )
  const dialog = await preview(user)
  await user.click(dialog.getByRole('button', { name: 'Replace workspace' }))
  expect(await dialog.findByRole('alert')).toHaveTextContent(
    'Could not complete this action',
  )
  expect(await workspaceRepository.getSnapshot()).toEqual(original)
  await user.click(dialog.getByRole('button', { name: 'Replace workspace' }))
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
  )
  expect((await workspaceRepository.getSnapshot()).projects[0].id).toBe(
    incoming.projects[0].id,
  )
})
it('blocks stale confirmation when local data changes after preview', async () => {
  const user = userEvent.setup()
  await ready()
  const dialog = await preview(user)
  await act(() =>
    projectRepository.toggleProjectFavorite(original.projects[0].id),
  )
  const changed = await workspaceRepository.getSnapshot()
  await user.click(dialog.getByRole('button', { name: 'Replace workspace' }))
  expect(await dialog.findByRole('alert')).toHaveTextContent(
    'workspace changed after this preview',
  )
  expect(
    dialog.getByRole('button', { name: 'Replace workspace' }),
  ).toBeDisabled()
  expect(await workspaceRepository.getSnapshot()).toEqual(changed)
  await user.click(dialog.getByRole('button', { name: 'Cancel' }))
})
it('treats a snapshot read failure as an error and allows retry', async () => {
  const user = userEvent.setup()
  const spy = vi
    .spyOn(workspaceRepository, 'getSnapshot')
    .mockRejectedValue(new Error('READ_FAILED'))
  render(<DataManagementPanel />)
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not read your local workspace',
  )
  expect(
    screen.getByRole('button', { name: 'Download JSON backup' }),
  ).toBeDisabled()
  spy.mockRestore()
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Download JSON backup' }),
    ).toBeEnabled(),
  )
})
it('prevents overlapping confirmation while a restore is pending', async () => {
  const user = userEvent.setup()
  await ready()
  const originalRestore = dataManagementRepository.restoreBackup.bind(
    dataManagementRepository,
  )
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const spy = vi
    .spyOn(dataManagementRepository, 'restoreBackup')
    .mockImplementation(async (...args) => {
      await gate
      return originalRestore(...args)
    })
  const dialog = await preview(user)
  await user.click(dialog.getByRole('button', { name: 'Replace workspace' }))
  expect(dialog.getByRole('button', { name: 'Restoring…' })).toBeDisabled()
  expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  expect(spy).toHaveBeenCalledTimes(1)
  await act(async () => {
    release()
    await gate
  })
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
  )
})
