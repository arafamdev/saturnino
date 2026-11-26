import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TASK_FILTERS,
  hasTaskFilters,
  isTaskOverdue,
  selectTasks,
} from './selectTasks'

const today = '2026-11-26'
const tasks = [
  {
    id: 'a',
    title: 'Revisão 10',
    description: 'Árvore',
    projectId: 'p1',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-11-25',
    position: 0,
    updatedAt: '2026-11-25T12:00:00Z',
  },
  {
    id: 'b',
    title: 'Revisão 2',
    description: '',
    projectId: 'p2',
    status: 'done',
    priority: 'urgent',
    dueDate: '2026-11-25',
    position: 1,
    updatedAt: '2026-11-26T12:00:00Z',
  },
  {
    id: 'c',
    title: 'Today',
    description: 'Review',
    projectId: 'p1',
    status: 'todo',
    priority: 'low',
    dueDate: today,
    position: 2,
    updatedAt: '2026-11-24T12:00:00Z',
  },
  {
    id: 'd',
    title: 'Future',
    description: '',
    projectId: 'p1',
    status: 'backlog',
    priority: 'medium',
    dueDate: '2026-11-27',
    position: 3,
    updatedAt: '2026-11-23T12:00:00Z',
  },
  {
    id: 'e',
    title: 'No date',
    description: '',
    projectId: 'p2',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    position: 4,
    updatedAt: '2026-11-22T12:00:00Z',
  },
]
const select = (filters = {}) =>
  selectTasks(
    tasks,
    { ...DEFAULT_TASK_FILTERS, ...filters },
    { today, locale: 'pt-PT' },
  ).map((task) => task.id)

describe('task selection', () => {
  it('keeps source order without filters and returns a new array', () => {
    expect(select()).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(selectTasks(tasks, DEFAULT_TASK_FILTERS, { today })).not.toBe(tasks)
  })
  it('normalizes case, whitespace and accents across title and description', () => {
    expect(select({ search: '  ARVORE  ' })).toEqual(['a'])
    expect(select({ search: 'revisao' })).toEqual(['a', 'b'])
  })
  it('combines all criteria with AND', () => {
    expect(
      select({
        search: 'revisao',
        status: 'todo',
        priority: 'high',
        projectId: 'p1',
        due: 'overdue',
      }),
    ).toEqual(['a'])
    expect(select({ status: 'done', projectId: 'p1' })).toEqual([])
  })
  it.each([
    ['overdue', ['a']],
    ['today', ['c']],
    ['upcoming', ['d']],
    ['none', ['e']],
  ])('filters civil dates: %s', (due, ids) =>
    expect(select({ due })).toEqual(ids),
  )
  it('excludes completed tasks from overdue', () => {
    expect(isTaskOverdue(tasks[0], today)).toBe(true)
    expect(isTaskOverdue(tasks[1], today)).toBe(false)
    expect(isTaskOverdue(tasks[2], today)).toBe(false)
    expect(isTaskOverdue(tasks[4], today)).toBe(false)
  })
  it.each([
    ['priority', ['b', 'a', 'd', 'e', 'c']],
    ['dueDate', ['a', 'b', 'c', 'd', 'e']],
    ['updated', ['b', 'a', 'c', 'd', 'e']],
  ])('sorts by %s without changing input', (sort, ids) => {
    const before = structuredClone(tasks)
    expect(select({ sort })).toEqual(ids)
    expect(tasks).toEqual(before)
  })
  it('sorts titles naturally in the current language', () => {
    expect(select({ search: 'revisao', sort: 'title' })).toEqual(['b', 'a'])
  })
  it('treats whitespace-only search as inactive and distinguishes sort', () => {
    expect(
      hasTaskFilters({
        ...DEFAULT_TASK_FILTERS,
        search: '  ',
        sort: 'priority',
      }),
    ).toBe(false)
    expect(hasTaskFilters({ ...DEFAULT_TASK_FILTERS, due: 'today' })).toBe(true)
  })
})
