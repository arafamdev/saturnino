import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TaskForm from './TaskForm'

const projects = [
  { id: 'project-1', name: 'Project 10' },
  { id: 'project-2', name: 'Project 2' },
]

function renderForm(props = {}) {
  const onSubmit = vi.fn()
  render(
    <TaskForm
      projects={projects}
      onSubmit={onSubmit}
      onCancel={() => {}}
      {...props}
    />,
  )
  return onSubmit
}

describe('Task form', () => {
  it('requires a title and a project, with errors linked to fields', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(await screen.findByText('Enter a task title.')).toBeInTheDocument()
    expect(screen.getByText('Choose a project.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Task title' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits explicit defaults with a contextual project', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm({ projectId: 'project-2' })
    await user.type(
      screen.getByRole('textbox', { name: 'Task title' }),
      'Write documentation',
    )
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Write documentation',
        description: '',
        projectId: 'project-2',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      }),
    )
  })

  it('prepopulates editing and sorts projects naturally', async () => {
    const user = userEvent.setup()
    renderForm({
      task: {
        id: 'task-1',
        title: 'Existing',
        description: 'Details',
        projectId: 'project-1',
        status: 'done',
        priority: 'urgent',
        dueDate: '2026-12-01',
      },
    })
    expect(screen.getByRole('textbox', { name: 'Task title' })).toHaveValue(
      'Existing',
    )
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Done',
    )
    expect(
      screen.getByRole('combobox', { name: 'Priority' }),
    ).toHaveTextContent('Urgent')
    expect(screen.getByLabelText('Due date')).toHaveTextContent('Dec 1, 2026')
    await user.click(screen.getByRole('combobox', { name: 'Project' }))
    expect(
      screen
        .getAllByRole('option')
        .slice(1, 3)
        .map((option) => option.textContent),
    ).toEqual(['Project 2', 'Project 10'])
  })

  it('shows repository errors and allows retry without losing values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('TASK_PROJECT_NOT_FOUND'))
      .mockResolvedValueOnce(undefined)
    renderForm({ projectId: 'project-1', onSubmit })
    await user.type(
      screen.getByRole('textbox', { name: 'Task title' }),
      'Preserve me',
    )
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This project no longer exists.',
    )
    expect(screen.getByRole('textbox', { name: 'Task title' })).toHaveValue(
      'Preserve me',
    )
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  })

  it('rejects titles above the normalized limit', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm({ projectId: 'project-1' })
    await user.type(
      screen.getByRole('textbox', { name: 'Task title' }),
      'x'.repeat(121),
    )
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('120 characters')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

it('rejects invalid manual civil dates and submits a corrected leap day without UTC conversion', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm({ projectId: 'project-1' })
  await user.type(
    screen.getByRole('textbox', { name: 'Task title' }),
    'Calendar QA',
  )
  await user.click(screen.getByRole('button', { name: 'Due date' }))
  const input = await screen.findByRole('textbox', {
    name: 'Date (YYYY-MM-DD)',
  })
  await user.type(input, '2026-02-29')
  await user.click(screen.getByRole('button', { name: 'Done', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Create task' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Enter a valid date.',
  )
  expect(onSubmit).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Due date' }))
  const corrected = await screen.findByRole('textbox', {
    name: 'Date (YYYY-MM-DD)',
  })
  await user.clear(corrected)
  await user.type(corrected, '2028-02-29')
  await user.click(screen.getByRole('button', { name: 'Done', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Create task' }))
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: '2028-02-29' }),
    ),
  )
})
