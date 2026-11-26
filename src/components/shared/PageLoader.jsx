import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function PageLoader() {
  const { t } = useTranslation('common')

  return (
    <div
      role="status"
      className="flex min-h-dvh flex-col items-center justify-center gap-4"
    >
      <LoaderCircle
        className="size-8 animate-spin text-primary motion-reduce:animate-none"
        aria-hidden="true"
      />

      <p className="text-sm text-muted-foreground">{t('status.loading')}</p>
    </div>
  )
}

export default PageLoader
