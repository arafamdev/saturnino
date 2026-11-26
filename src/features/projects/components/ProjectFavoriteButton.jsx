import { useState } from 'react'

import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { projectRepository } from '../services/projectRepository'

function ProjectFavoriteButton({ project }) {
  const { t } = useTranslation('app')

  const [isUpdating, setIsUpdating] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isFavorite = project.isFavorite === true

  const actionLabel = t(isFavorite ? 'favorites.remove' : 'favorites.add', {
    name: project.name,
  })

  async function handleToggleFavorite() {
    if (isUpdating) return

    setIsUpdating(true)
    setHasError(false)

    try {
      await projectRepository.toggleProjectFavorite(project.id)
    } catch {
      setHasError(true)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative z-10 shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={t('favorites.toggle', {
          name: project.name,
        })}
        aria-pressed={isFavorite}
        aria-busy={isUpdating}
        title={actionLabel}
        disabled={isUpdating}
        onClick={handleToggleFavorite}
      >
        <Star
          className={cn(
            'size-5 transition-colors',
            isFavorite
              ? 'fill-amber-400 text-amber-500 dark:text-amber-400'
              : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />
      </Button>

      {hasError && (
        <p
          role="alert"
          className="absolute top-full right-0 z-20 mt-1 w-48 rounded-md border bg-popover p-2 text-xs text-destructive shadow-md"
        >
          {t('favorites.updateError')}
        </p>
      )}
    </div>
  )
}

export default ProjectFavoriteButton
