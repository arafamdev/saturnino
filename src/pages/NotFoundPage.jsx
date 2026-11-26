import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

function NotFoundPage() {
  const { t } = useTranslation('app')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-6xl font-semibold text-primary">404</h1>

      <p className="text-xl font-medium">{t('notFound.title')}</p>

      <p className="text-muted-foreground">{t('notFound.description')}</p>

      <Button asChild>
        <Link to="/">{t('notFound.backToHome')}</Link>
      </Button>
    </main>
  )
}

export default NotFoundPage
