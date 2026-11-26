import { FolderKanban, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

function ProjectsEmptyState({ onCreate }) {
  const { t } = useTranslation('app')

  return (
    <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FolderKanban className="size-8" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold">{t('projects.empty.title')}</h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {t('projects.empty.description')}
      </p>

      <Button type="button" onClick={onCreate} className="mt-6 min-h-11 px-4">
        <Plus aria-hidden="true" />
        {t('projects.actions.create')}
      </Button>
    </section>
  )
}

export default ProjectsEmptyState
