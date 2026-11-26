function cell(value) {
  let text = String(value ?? '')
  // Quoting handles CSV boundaries; the tab prefix reduces spreadsheet formula interpretation.
  if (/^[\s]*[=+\-@]/u.test(text.normalize('NFKC')) || /^[\t\r\n]/.test(text))
    text = `\t${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function serializeTaskCsv({ projects, tasks }) {
  const projectsById = new Map(
    projects.map((project) => [project.id, project.name]),
  )
  const headers = [
    'id',
    'projectId',
    'project',
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'position',
    'createdAt',
    'updatedAt',
    'completedAt',
  ]
  const rows = tasks.map((task) => [
    task.id,
    task.projectId,
    projectsById.get(task.projectId) ?? '',
    task.title,
    task.description,
    task.status,
    task.priority,
    task.dueDate,
    task.position,
    task.createdAt,
    task.updatedAt,
    task.completedAt,
  ])
  return (
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') +
    '\r\n'
  )
}
