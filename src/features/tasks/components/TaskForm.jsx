import { useId } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { isValidDateOnly } from '@/lib/dates/dateOnly'

import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
} from '../data/taskOptions'

const fieldClassName =
  'min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-invalid:border-destructive disabled:opacity-50'

function TaskField({ id, label, error, children }) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}

function TaskForm({ task, projectId, projects, onSubmit, onCancel }) {
  const { t, i18n } = useTranslation('app')
  const formId = useId()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? projectId ?? '',
      status: task?.status ?? DEFAULT_TASK_STATUS,
      priority: task?.priority ?? DEFAULT_TASK_PRIORITY,
      dueDate: task?.dueDate ?? '',
    },
  })
  const collator = new Intl.Collator(i18n.resolvedLanguage, {
    numeric: true,
    sensitivity: 'base',
  })
  const sortedProjects = [...projects].sort((first, second) =>
    collator.compare(first.name, second.name),
  )

  const submitAction = task ? 'tasks.actions.save' : 'tasks.actions.create'

  function fieldAttributes(name) {
    return {
      id: `${formId}-${name}`,
      disabled: isSubmitting,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${formId}-${name}-error` : undefined,
      className: fieldClassName,
    }
  }

  async function handleFormSubmit(data) {
    try {
      await onSubmit(data)
    } catch (error) {
      const errorKeys = {
        TASK_TITLE_REQUIRED: 'titleRequired',
        TASK_TITLE_TOO_LONG: 'titleTooLong',
        TASK_DESCRIPTION_INVALID: 'descriptionInvalid',
        TASK_PROJECT_REQUIRED: 'projectRequired',
        TASK_PROJECT_NOT_FOUND: 'projectNotFound',
        TASK_STATUS_INVALID: 'statusInvalid',
        TASK_PRIORITY_INVALID: 'priorityInvalid',
        TASK_DUE_DATE_INVALID: 'dueDateInvalid',
        TASK_NOT_FOUND: 'notFound',
      }
      setError('root', {
        message: t(`tasks.errors.${errorKeys[error?.message] ?? 'saveFailed'}`),
      })
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <TaskField
        id={`${formId}-title`}
        label={t('tasks.form.title')}
        error={errors.title}
      >
        <input
          {...fieldAttributes('title')}
          type="text"
          required
          {...register('title', {
            validate: {
              required: (value) =>
                Boolean(value.trim()) || t('tasks.errors.titleRequired'),
              maxLength: (value) =>
                value.trim().length <= TASK_TITLE_MAX_LENGTH ||
                t('tasks.errors.titleTooLong'),
            },
          })}
        />
      </TaskField>
      <TaskField
        id={`${formId}-description`}
        label={t('tasks.form.description')}
        error={errors.description}
      >
        <textarea
          {...fieldAttributes('description')}
          rows={3}
          {...register('description', {
            validate: (value) =>
              value.trim().length <= TASK_DESCRIPTION_MAX_LENGTH ||
              t('tasks.errors.descriptionInvalid'),
          })}
        />
      </TaskField>
      <TaskField
        id={`${formId}-projectId`}
        label={t('tasks.form.project')}
        error={errors.projectId}
      >
        <select
          {...fieldAttributes('projectId')}
          required
          {...register('projectId', {
            required: t('tasks.errors.projectRequired'),
          })}
        >
          <option value="">{t('tasks.form.chooseProject')}</option>
          {sortedProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </TaskField>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <TaskField
          id={`${formId}-status`}
          label={t('tasks.form.status')}
          error={errors.status}
        >
          <select {...fieldAttributes('status')} {...register('status')}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`tasks.status.${status}`)}
              </option>
            ))}
          </select>
        </TaskField>
        <TaskField
          id={`${formId}-priority`}
          label={t('tasks.form.priority')}
          error={errors.priority}
        >
          <select {...fieldAttributes('priority')} {...register('priority')}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`tasks.priority.${priority}`)}
              </option>
            ))}
          </select>
        </TaskField>
      </div>
      <TaskField
        id={`${formId}-dueDate`}
        label={t('tasks.form.dueDate')}
        error={errors.dueDate}
      >
        <input
          {...fieldAttributes('dueDate')}
          type="date"
          min="0001-01-01"
          max="9999-12-31"
          {...register('dueDate', {
            validate: (value) =>
              !value ||
              isValidDateOnly(value) ||
              t('tasks.errors.dueDateInvalid'),
          })}
        />
      </TaskField>
      {errors.root && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="min-h-11"
        >
          {t('tasks.actions.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-h-11">
          {t(isSubmitting ? 'tasks.actions.saving' : submitAction)}
        </Button>
      </div>
    </form>
  )
}

export default TaskForm
