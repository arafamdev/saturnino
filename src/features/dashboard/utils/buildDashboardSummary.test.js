import { expect, it } from 'vitest'
import { buildDashboardSummary } from './buildDashboardSummary'
const today = '2026-11-26'
const project = { id: 'p', name: 'QA', updatedAt: '2026-11-26T12:00:00Z' }
const task = (id, extra = {}) => ({
  id,
  projectId: 'p',
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  ...extra,
})

it('returns safe empty metrics without division by zero', () => {
  expect(buildDashboardSummary({ projects: [], tasks: [] }, today)).toEqual({
    projectCount: 0,
    taskCount: 0,
    completed: 0,
    open: 0,
    overdue: 0,
    completionRate: 0,
    statusCounts: { backlog: 0, todo: 0, 'in-progress': 0, done: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    activity: {
      days: Array.from({ length: 14 }, (_, index) => ({
        date: `2026-11-${13 + index}`,
        created: 0,
        completed: 0,
      })),
      hasComparison: false,
    },
    projectProgress: [],
    upcoming: [],
    overdueTasks: [],
    recentTasks: [],
  })
})
it('derives status counts, completion and overdue without changing source records', () => {
  const snapshot = {
    projects: [project, { ...project, id: 'empty' }],
    tasks: [
      task('a', { dueDate: '2026-11-25' }),
      task('b', { status: 'done', dueDate: '2026-11-20' }),
      task('c', { status: 'in-progress', dueDate: today }),
      task('d', { status: 'backlog' }),
    ],
  }
  const before = structuredClone(snapshot)
  const summary = buildDashboardSummary(snapshot, today)
  expect(summary).toMatchObject({
    projectCount: 2,
    taskCount: 4,
    completed: 1,
    open: 3,
    overdue: 1,
    completionRate: 25,
    statusCounts: { backlog: 1, todo: 1, 'in-progress': 1, done: 1 },
  })
  expect(summary.projectProgress.find((item) => item.id === 'p')).toMatchObject(
    { taskCount: 4, completedCount: 1, progress: 25 },
  )
  expect(
    summary.projectProgress.find((item) => item.id === 'empty'),
  ).toMatchObject({ taskCount: 0, progress: 0 })
  expect(summary.upcoming.map((item) => item.id)).toEqual(['c'])
  expect(snapshot).toEqual(before)
})
it('sorts upcoming unfinished deadlines and limits them to five', () => {
  const tasks = Array.from({ length: 8 }, (_, index) =>
    task(String(index), {
      dueDate: `2026-12-${String(8 - index).padStart(2, '0')}`,
    }),
  )
  tasks.push(task('done', { dueDate: today, status: 'done' }))
  const summary = buildDashboardSummary({ projects: [project], tasks }, today)
  expect(summary.upcoming.map((item) => item.id)).toEqual([
    '7',
    '6',
    '5',
    '4',
    '3',
  ])
})
it('recalculates progress when a completed task is reopened', () => {
  const tasks = [task('done', { status: 'done' })]
  expect(
    buildDashboardSummary({ projects: [project], tasks }, today).completionRate,
  ).toBe(100)
  expect(
    buildDashboardSummary(
      { projects: [project], tasks: [{ ...tasks[0], status: 'todo' }] },
      today,
    ).completionRate,
  ).toBe(0)
})

it('derives priority distribution, overdue attention and recent retained updates without mutation', () => {
  const tasks = Array.from({ length: 6 }, (_, index) =>
    task(String(index), {
      priority: ['low', 'medium', 'high', 'urgent'][index % 4],
      dueDate: `2026-11-${10 + index}`,
      updatedAt: `2026-11-26T12:00:0${index}.000Z`,
    }),
  )
  tasks.push(
    task('completed', {
      status: 'done',
      priority: 'high',
      dueDate: '2026-11-01',
      updatedAt: '2026-11-26T11:00:00.000Z',
    }),
  )
  const snapshot = { projects: [project], tasks }
  const before = structuredClone(snapshot)
  const summary = buildDashboardSummary(snapshot, today)
  expect(summary.priorityCounts).toEqual({
    low: 2,
    medium: 2,
    high: 2,
    urgent: 1,
  })
  expect(summary.overdue).toBe(6)
  expect(summary.overdueTasks.map((task) => task.id)).toEqual([
    '0',
    '1',
    '2',
    '3',
    '4',
  ])
  expect(summary.recentTasks.map((task) => task.id)).toEqual([
    '5',
    '4',
    '3',
    '2',
    '1',
  ])
  expect(summary.upcoming).toEqual([])
  expect(snapshot).toEqual(before)
})
