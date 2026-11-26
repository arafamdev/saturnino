import { useTranslation } from 'react-i18next'

function OverviewPage() {
  const { t } = useTranslation('app')

  return <h1 className="text-2xl font-semibold">{t('navigation.overview')}</h1>
}

export default OverviewPage
