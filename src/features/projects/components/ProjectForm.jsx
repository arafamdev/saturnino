import { useId } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { DEFAULT_PROJECT_COLOR } from '../data/projectColors'
import ProjectColorPicker from './ProjectColorPicker'

const fieldClassName =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive disabled:opacity-50'

function ProjectForm({ project, onSubmit, onCancel }) {
  const { t } = useTranslation('app')
  const formId = useId()

  const nameId = `${formId}-name`
  const descriptionId = `${formId}-description`

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      color: project?.color ?? DEFAULT_PROJECT_COLOR,
    },
  })

  const isEditing = Boolean(project)

  async function handleFormSubmit(formData) {
    try {
      await onSubmit(formData)
    } catch (error) {
      const errorKey = {
        PROJECT_NAME_REQUIRED: 'nameRequired',
        PROJECT_NAME_TOO_LONG: 'nameTooLong',
        PROJECT_DESCRIPTION_INVALID: 'descriptionInvalid',
        PROJECT_DESCRIPTION_TOO_LONG: 'descriptionTooLong',
        PROJECT_COLOR_INVALID: 'colorInvalid',
        PROJECT_NOT_FOUND: 'notFound',
      }[error?.message]

      setError('root', {
        message: t(`projects.errors.${errorKey ?? 'saveFailed'}`),
      })
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
    >
      {/* Project name */}
      <div className="space-y-2">
        <label htmlFor={nameId} className="text-sm font-medium">
          {t('projects.form.name')}
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        </label>

        <input
          id={nameId}
          type="text"
          required
          disabled={isSubmitting}
          placeholder={t('projects.form.namePlaceholder')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          className={fieldClassName}
          {...register('name', {
            validate: {
              required: (value) =>
                Boolean(value.trim()) || t('projects.errors.nameRequired'),
              maxLength: (value) =>
                value.trim().length <= 80 || t('projects.errors.nameTooLong'),
            },
          })}
        />

        {errors.name && (
          <p
            id={`${nameId}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Project description */}
      <div className="space-y-2">
        <label htmlFor={descriptionId} className="text-sm font-medium">
          {t('projects.form.description')}
        </label>

        <textarea
          id={descriptionId}
          rows={4}
          disabled={isSubmitting}
          placeholder={t('projects.form.descriptionPlaceholder')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? `${descriptionId}-error` : undefined
          }
          className={`${fieldClassName} resize-y`}
          {...register('description', {
            validate: (value) =>
              value.trim().length <= 500 ||
              t('projects.errors.descriptionTooLong'),
          })}
        />

        {errors.description && (
          <p
            id={`${descriptionId}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Project color */}
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <ProjectColorPicker
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
          />
        )}
      />

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      {/* Form actions */}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="min-h-11 px-4"
        >
          {t('projects.actions.cancel')}
        </Button>

        <Button type="submit" disabled={isSubmitting} className="min-h-11 px-4">
          {isSubmitting
            ? t('projects.actions.saving')
            : t(
                isEditing ? 'projects.actions.save' : 'projects.actions.create',
              )}
        </Button>
      </div>
    </form>
  )
}

export default ProjectForm
