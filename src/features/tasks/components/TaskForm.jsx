import { useEffect, useId, useRef } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isValidDateOnly } from '@/lib/dates/dateOnly'

import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
} from '../data/taskOptions'

function TaskForm({
  task,
  initialStatus,
  projectId,
  projects,
  onSubmit,
  onCancel,
  onDirtyChange,
  stickyActions = false,
  children,
}) {
  const { t, i18n } = useTranslation('app')
  const formId = useId()
  const submitErrorRef = useRef(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? projectId ?? '',
      status: task?.status ?? initialStatus ?? DEFAULT_TASK_STATUS,
      priority: task?.priority ?? DEFAULT_TASK_PRIORITY,
      dueDate: task?.dueDate ?? '',
    },
  })
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (errors.root) submitErrorRef.current?.focus()
  }, [errors.root])

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
    }
  }

  function selectField(name, options, placeholder) {
    return (
      <Controller
        name={name}
        control={control}
        rules={
          name === 'projectId'
            ? { required: t('tasks.errors.projectRequired') }
            : undefined
        }
        render={({ field }) => (
          <Select
            {...fieldAttributes(name)}
            ref={field.ref}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onValueChange={field.onChange}
            options={options}
            placeholder={placeholder}
          />
        )}
      />
    )
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
        TASK_UPDATE_CONFLICT: 'updateConflict',
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
      className={stickyActions ? 'flex min-h-0 flex-1 flex-col' : 'space-y-6'}
    >
      <div
        className={
          stickyActions
            ? 'min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6'
            : 'space-y-6'
        }
      >
        <Field
          id={`${formId}-title`}
          label={t('tasks.form.title')}
          error={errors.title}
          required
        >
          <Input
            {...fieldAttributes('title')}
            placeholder={t('tasks.form.titlePlaceholder')}
            className="font-medium"
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
        </Field>
        <Field
          id={`${formId}-description`}
          label={t('tasks.form.description')}
          error={errors.description}
        >
          <Textarea
            {...fieldAttributes('description')}
            rows={4}
            placeholder={t('tasks.form.descriptionPlaceholder')}
            {...register('description', {
              validate: (value) =>
                value.trim().length <= TASK_DESCRIPTION_MAX_LENGTH ||
                t('tasks.errors.descriptionInvalid'),
            })}
          />
        </Field>
        <fieldset className="grid min-w-0 gap-4 rounded-xl border bg-card/50 p-4">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            {t('tasks.form.planning')}
          </legend>
          <Field
            id={`${formId}-projectId`}
            label={t('tasks.form.project')}
            error={errors.projectId}
          >
            {selectField(
              'projectId',
              [
                ['', t('tasks.form.chooseProject')],
                ...sortedProjects.map((project) => [project.id, project.name]),
              ],
              t('tasks.form.chooseProject'),
            )}
          </Field>
          <div className="grid min-w-0 gap-4 min-[360px]:grid-cols-2">
            <Field
              id={`${formId}-status`}
              label={t('tasks.form.status')}
              error={errors.status}
            >
              {selectField(
                'status',
                TASK_STATUSES.map((value) => [
                  value,
                  t(`tasks.status.${value}`),
                ]),
              )}
            </Field>
            <Field
              id={`${formId}-priority`}
              label={t('tasks.form.priority')}
              error={errors.priority}
            >
              {selectField(
                'priority',
                TASK_PRIORITIES.map((value) => [
                  value,
                  t(`tasks.priority.${value}`),
                ]),
              )}
            </Field>
          </div>
          <Field
            id={`${formId}-dueDate`}
            label={t('tasks.form.dueDate')}
            error={errors.dueDate}
          >
            <Controller
              name="dueDate"
              control={control}
              rules={{
                validate: (value) =>
                  !value ||
                  isValidDateOnly(value) ||
                  t('tasks.errors.dueDateInvalid'),
              }}
              render={({ field }) => (
                <DatePicker {...fieldAttributes('dueDate')} {...field} />
              )}
            />
          </Field>
        </fieldset>
        {errors.root && (
          <p
            ref={submitErrorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errors.root.message}
          </p>
        )}
        {children}
      </div>
      <div
        className={`flex shrink-0 flex-wrap justify-end gap-3 border-t bg-background py-4 ${stickyActions ? 'px-5 sm:px-6' : ''}`}
      >
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="min-h-11 px-4"
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
