import { expect, it } from 'vitest'
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  MAX_BACKUP_BYTES,
  getWorkspaceRevision,
  parseBackup,
  serializeBackup,
  validateBackup,
} from './backupFormat'
const timestamp = '2026-11-26T12:00:00.000Z'
const project = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Backup QA',
  description: '',
  color: '#818CF8',
  isFavorite: true,
  createdAt: timestamp,
  updatedAt: timestamp,
}
const task = {
  id: '22222222-2222-4222-8222-222222222222',
  projectId: project.id,
  title: 'Preserve me',
  description: 'Árvore',
  status: 'todo',
  priority: 'high',
  dueDate: '2026-12-15',
  position: 4,
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: null,
}
function backup() {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: timestamp,
    projects: [{ ...project }],
    tasks: [{ ...task }],
  }
}

it('round-trips every supported field, including favorite, civil date and position gaps', () => {
  const source = backup()
  expect(
    parseBackup(
      serializeBackup(
        { projects: source.projects, tasks: source.tasks },
        timestamp,
      ),
    ),
  ).toEqual(source)
})
it('accepts an empty backup and a UTF-8 BOM', () => {
  expect(
    parseBackup(
      '\uFEFF' + serializeBackup({ projects: [], tasks: [] }, timestamp),
    ),
  ).toMatchObject({ projects: [], tasks: [] })
})
it.each(['{', 'null', '[]', '"text"'])('rejects malformed payload %s', (text) =>
  expect(() => parseBackup(text)).toThrow('BACKUP_INVALID'),
)
it('rejects unsupported versions distinctly', () =>
  expect(() => validateBackup({ ...backup(), version: 2 })).toThrow(
    'BACKUP_VERSION_UNSUPPORTED',
  ))
it('rejects oversized input before parsing', () =>
  expect(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow(
    'BACKUP_TOO_LARGE',
  ))
it.each([
  [
    'invalid ID',
    (b) => {
      b.projects[0].id = 'not-a-uuid'
    },
  ],
  [
    'duplicate project',
    (b) => {
      b.projects.push({ ...b.projects[0] })
    },
  ],
  [
    'duplicate task',
    (b) => {
      b.tasks.push({ ...b.tasks[0] })
    },
  ],
  [
    'duplicate position',
    (b) => {
      b.tasks.push({
        ...b.tasks[0],
        id: '33333333-3333-4333-8333-333333333333',
      })
    },
  ],
  [
    'orphan task',
    (b) => {
      b.projects = []
    },
  ],
  [
    'bad status',
    (b) => {
      b.tasks[0].status = 'unknown'
    },
  ],
  [
    'bad priority',
    (b) => {
      b.tasks[0].priority = 'unknown'
    },
  ],
  [
    'bad due date',
    (b) => {
      b.tasks[0].dueDate = '2026-02-30'
    },
  ],
  [
    'negative position',
    (b) => {
      b.tasks[0].position = -1
    },
  ],
  [
    'fractional position',
    (b) => {
      b.tasks[0].position = 0.5
    },
  ],
  [
    'empty title',
    (b) => {
      b.tasks[0].title = '  '
    },
  ],
  [
    'long title',
    (b) => {
      b.tasks[0].title = 'a'.repeat(121)
    },
  ],
  [
    'long description',
    (b) => {
      b.tasks[0].description = 'a'.repeat(2001)
    },
  ],
  [
    'invalid color',
    (b) => {
      b.projects[0].color = 'red'
    },
  ],
  [
    'invalid favorite',
    (b) => {
      b.projects[0].isFavorite = 'true'
    },
  ],
  [
    'invalid timestamp',
    (b) => {
      b.tasks[0].createdAt = 'yesterday'
    },
  ],
  [
    'reversed timestamps',
    (b) => {
      b.tasks[0].createdAt = '2026-11-27T12:00:00.000Z'
    },
  ],
  [
    'completion on open task',
    (b) => {
      b.tasks[0].completedAt = timestamp
    },
  ],
  [
    'missing completion on done task',
    (b) => {
      b.tasks[0].status = 'done'
    },
  ],
  [
    'future completion',
    (b) => {
      b.tasks[0].status = 'done'
      b.tasks[0].completedAt = '2026-11-27T12:00:00.000Z'
    },
  ],
  [
    'missing task field',
    (b) => {
      delete b.tasks[0].status
    },
  ],
  [
    'unknown project field',
    (b) => {
      b.projects[0].extra = 'not part of version 1'
    },
  ],
])('rejects %s', (_, mutate) => {
  const value = backup()
  mutate(value)
  expect(() => validateBackup(value)).toThrow('BACKUP_INVALID')
})
it('preserves a valid completion timestamp', () => {
  const value = backup()
  value.tasks[0].status = 'done'
  value.tasks[0].completedAt = timestamp
  expect(validateBackup(value).tasks[0].completedAt).toBe(timestamp)
})
it('canonicalizes UUID casing and detects case-insensitive duplicates', () => {
  const value = backup()
  value.projects[0].id = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'
  value.tasks[0].projectId = value.projects[0].id
  expect(validateBackup(value).projects[0].id).toBe(
    value.projects[0].id.toLowerCase(),
  )
  value.projects.push({
    ...value.projects[0],
    id: value.projects[0].id.toLowerCase(),
  })
  expect(() => validateBackup(value)).toThrow('BACKUP_INVALID')
})
it('makes revisions independent of record and property order but detects favorite changes', () => {
  const source = { projects: [project], tasks: [task] }
  const reordered = {
    tasks: [Object.fromEntries(Object.entries(task).reverse())],
    projects: [Object.fromEntries(Object.entries(project).reverse())],
  }
  expect(getWorkspaceRevision(source)).toBe(getWorkspaceRevision(reordered))
  expect(
    getWorkspaceRevision({
      ...source,
      projects: [{ ...project, isFavorite: false }],
    }),
  ).not.toBe(getWorkspaceRevision(source))
})
