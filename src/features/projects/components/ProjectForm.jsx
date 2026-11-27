import { useId } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { DEFAULT_PROJECT_COLOR } from '../data/projectColors'
import ProjectColorPicker from './ProjectColorPicker'

function ProjectForm({ project, onSubmit, onCancel, scrollable = false }) {
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
      className={scrollable ? 'flex min-h-0 flex-1 flex-col' : 'space-y-6'}
    >
      <div
        className={
          scrollable
            ? 'min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6'
            : 'space-y-6'
        }
      >
        <Field
          id={nameId}
          label={t('projects.form.name')}
          error={errors.name}
          required
        >
          <Input
            id={nameId}
            type="text"
            required
            disabled={isSubmitting}
            placeholder={t('projects.form.namePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            {...register('name', {
              validate: {
                required: (value) =>
                  Boolean(value.trim()) || t('projects.errors.nameRequired'),
                maxLength: (value) =>
                  value.trim().length <= 80 || t('projects.errors.nameTooLong'),
              },
            })}
          />
        </Field>

        <Field
          id={descriptionId}
          label={t('projects.form.description')}
          error={errors.description}
        >
          <Textarea
            id={descriptionId}
            rows={4}
            disabled={isSubmitting}
            placeholder={t('projects.form.descriptionPlaceholder')}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? `${descriptionId}-error` : undefined
            }
            className="resize-y"
            {...register('description', {
              validate: (value) =>
                value.trim().length <= 500 ||
                t('projects.errors.descriptionTooLong'),
            })}
          />
        </Field>

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
      </div>
      {/* Form actions */}
      <div
        className={`flex shrink-0 flex-wrap justify-end gap-3 border-t py-4 ${scrollable ? 'px-5 sm:px-6' : ''}`}
      >
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
