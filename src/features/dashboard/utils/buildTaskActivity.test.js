import { expect, it } from 'vitest'

import { buildTaskActivity, timestampDateOnly } from './buildTaskActivity'

const stamp = (day) => new Date(2026, 10, day, 12).toISOString()

it('counts only retained creation dates and current completions within the local window', () => {
  const tasks = [
    {
      id: 'first',
      createdAt: stamp(13),
      status: 'done',
      completedAt: stamp(26),
    },
    {
      id: 'reopened',
      createdAt: stamp(26),
      status: 'todo',
      completedAt: stamp(25),
    },
    { id: 'old', createdAt: stamp(12), status: 'done', completedAt: stamp(12) },
    {
      id: 'future',
      createdAt: stamp(27),
      status: 'done',
      completedAt: stamp(27),
    },
    { id: 'invalid', createdAt: 'invalid', status: 'done', completedAt: null },
  ]
  const before = structuredClone(tasks)
  const activity = buildTaskActivity(tasks, '2026-11-26')
  expect(activity.days).toHaveLength(14)
  expect(activity.days[0]).toEqual({
    date: '2026-11-13',
    created: 1,
    completed: 0,
  })
  expect(activity.days.at(-1)).toEqual({
    date: '2026-11-26',
    created: 1,
    completed: 1,
  })
  expect(activity.days.find((day) => day.date === '2026-11-25').completed).toBe(
    0,
  )
  expect(activity.days.reduce((sum, day) => sum + day.created, 0)).toBe(2)
  expect(activity.hasComparison).toBe(true)
  expect(tasks).toEqual(before)
})

it('requires data on multiple days rather than inventing a trend from one day', () => {
  expect(buildTaskActivity([], '2026-11-26').hasComparison).toBe(false)
  expect(
    buildTaskActivity([{ createdAt: stamp(26), status: 'todo' }], '2026-11-26')
      .hasComparison,
  ).toBe(false)
})

it('builds consecutive civil dates across a daylight-saving boundary', () => {
  const days = buildTaskActivity([], '2026-03-09').days
  expect(days).toHaveLength(14)
  expect(new Set(days.map((day) => day.date)).size).toBe(14)
  expect(days[0].date).toBe('2026-02-24')
  expect(days.at(-1).date).toBe('2026-03-09')
})

it('converts timestamp instants to local dates without using their UTC date substring', () => {
  const lateEvening = new Date(2026, 0, 1, 23, 30)
  expect(timestampDateOnly(lateEvening.toISOString())).toBe('2026-01-01')
  expect(timestampDateOnly('invalid')).toBe('')
  expect(timestampDateOnly(null)).toBe('')
})

it('handles an invalid day and the supported civil-year boundary safely', () => {
  expect(buildTaskActivity([], 'invalid')).toEqual({
    days: [],
    hasComparison: false,
  })
  expect(buildTaskActivity([], '0001-01-01').days).toEqual([
    { date: '0001-01-01', created: 0, completed: 0 },
  ])
})
