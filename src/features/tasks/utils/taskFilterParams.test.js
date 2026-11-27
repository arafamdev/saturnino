import { expect, it } from 'vitest'

import { DEFAULT_TASK_FILTERS } from './selectTasks'
import { readTaskFilterParams, writeTaskFilterParams } from './taskFilterParams'

it('reads valid combined dashboard links without changing the query', () => {
  const params = new URLSearchParams(
    'status=todo&priority=high&due=overdue&projectId=project-1&sort=updated&search=caf%C3%A9',
  )
  const before = params.toString()
  expect(readTaskFilterParams(params)).toEqual({
    status: 'todo',
    priority: 'high',
    due: 'overdue',
    projectId: 'project-1',
    sort: 'updated',
    search: 'café',
  })
  expect(params.toString()).toBe(before)
})

it('normalizes invalid values and ignores another project in a scoped workspace', () => {
  expect(
    readTaskFilterParams(
      new URLSearchParams(
        'status=unknown&priority=other&due=forever&sort=random&projectId=%3Cinvalid%3E',
      ),
    ),
  ).toEqual(DEFAULT_TASK_FILTERS)
  expect(
    readTaskFilterParams(
      new URLSearchParams('status=done&projectId=other'),
      'current',
    ),
  ).toEqual({ ...DEFAULT_TASK_FILTERS, status: 'done' })
})

it('writes shareable filters and clears only owned parameters when resetting', () => {
  const initial = new URLSearchParams('source=dashboard&status=todo')
  const next = writeTaskFilterParams(initial, {
    ...DEFAULT_TASK_FILTERS,
    due: 'overdue',
  })
  expect(next.get('source')).toBe('dashboard')
  expect(next.get('due')).toBe('overdue')
  expect(next.has('status')).toBe(false)
  expect(initial.get('status')).toBe('todo')
  expect(writeTaskFilterParams(next, DEFAULT_TASK_FILTERS).toString()).toBe(
    'source=dashboard',
  )
})

it('cannot serialize a foreign-project filter into a scoped workspace', () => {
  const next = writeTaskFilterParams(
    new URLSearchParams(),
    { ...DEFAULT_TASK_FILTERS, projectId: 'other', priority: 'urgent' },
    'current',
  )
  expect(next.has('projectId')).toBe(false)
  expect(next.get('priority')).toBe('urgent')
})
