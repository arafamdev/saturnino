import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { PROJECT_COLORS } from '../data/projectColors'

function ProjectColorPicker({ value, onChange, disabled = false }) {
  const { t } = useTranslation('app')

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium">
        {t('projects.form.color')}
      </legend>

      <div className="flex flex-wrap gap-2">
        {PROJECT_COLORS.map((projectColor) => {
          const isSelected = value === projectColor.value
          const colorLabel = t(`projects.colors.${projectColor.id}`)

          return (
            <label key={projectColor.id} className="relative cursor-pointer">
              <input
                type="radio"
                name="project-color"
                value={projectColor.value}
                checked={isSelected}
                onChange={() => onChange(projectColor.value)}
                className="peer sr-only"
              />

              <span
                title={colorLabel}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full transition-transform',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  'peer-disabled:opacity-50',
                  isSelected &&
                    'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
                style={{ backgroundColor: projectColor.value }}
              >
                {isSelected && (
                  <Check className="size-5 text-slate-950" aria-hidden="true" />
                )}
              </span>

              <span className="sr-only">{colorLabel}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ProjectColorPicker
