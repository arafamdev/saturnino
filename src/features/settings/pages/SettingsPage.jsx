import { useTranslation } from 'react-i18next'

function SettingsPage() {
  const { t } = useTranslation('app')

  return <h1 className="text-2xl font-semibold">{t('navigation.settings')}</h1>
}

export default SettingsPage
