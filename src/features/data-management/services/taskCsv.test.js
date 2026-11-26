import { expect, it } from 'vitest'
import { serializeTaskCsv } from './taskCsv'
const row = (title, extra = {}) => ({
  id: 'task',
  projectId: 'project',
  title,
  description: '',
  status: 'todo',
  priority: 'high',
  dueDate: null,
  position: 0,
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
  completedAt: null,
  ...extra,
})
it('includes UTF-8 BOM, headers, CRLF and stable export fields', () => {
  const csv = serializeTaskCsv({
    projects: [{ id: 'project', name: 'QA' }],
    tasks: [row('Árvore')],
  })
  expect(csv.startsWith('\uFEFF"id","projectId","project"')).toBe(true)
  expect(csv).toContain('"QA","Árvore"')
  expect(csv.endsWith('\r\n')).toBe(true)
})
it('escapes commas, quotes and multiline content inside quoted cells', () => {
  expect(
    serializeTaskCsv({
      projects: [],
      tasks: [row('A, "quoted" task', { description: 'Line one\nLine two' })],
    }),
  ).toContain('"A, ""quoted"" task","Line one\nLine two"')
})
it.each([
  '=1+2',
  '+SUM(A1)',
  '-1+2',
  '@SUM(A1)',
  '  =1+2',
  '＝1+2',
  '＋1',
  '－1',
  '＠SUM(A1)',
  '\tvalue',
  '\rvalue',
  '\nvalue',
])('prefixes formula-like or control-leading data: %s', (value) => {
  expect(serializeTaskCsv({ projects: [], tasks: [row(value)] })).toContain(
    `"\t${value}"`,
  )
})
it('also neutralizes project names and leaves the source unchanged', () => {
  const snapshot = {
    projects: [{ id: 'project', name: '=1+1' }],
    tasks: [row('Normal')],
  }
  const before = structuredClone(snapshot)
  expect(serializeTaskCsv(snapshot)).toContain('"\t=1+1"')
  expect(snapshot).toEqual(before)
})
it('exports only headers for an empty workspace', () =>
  expect(
    serializeTaskCsv({ projects: [], tasks: [] }).split('\r\n'),
  ).toHaveLength(2))
