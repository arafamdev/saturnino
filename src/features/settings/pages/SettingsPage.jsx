import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/app/providers/theme/useTheme'
import { supportedLanguages } from '@/i18n/languages'
import SidebarCustomization from '@/layouts/components/SidebarCustomization'
import { useSidebar } from '@/layouts/hooks/useSidebar'
import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
} from '@/layouts/state/sidebarReducer'

function SettingsPage() {
  const { t, i18n } = useTranslation('app')
  const { theme, setTheme } = useTheme()
  const { width, compact, setWidth, setCompact } = useSidebar()
  const id = useId()
  const [applied, setApplied] = useState(false)
  const [languageError, setLanguageError] = useState(false)
  const [changingLanguage, setChangingLanguage] = useState(false)
  const controlClass =
    'mt-2 min-h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground'
  const widths = [
    ...new Set([
      MIN_SIDEBAR_WIDTH,
      DEFAULT_SIDEBAR_WIDTH,
      320,
      MAX_SIDEBAR_WIDTH,
      width,
    ]),
  ].sort((a, b) => a - b)

  async function changeLanguage(event) {
    const language = event.target.value
    if (!supportedLanguages.some((item) => item.code === language)) return
    setChangingLanguage(true)
    setLanguageError(false)
    setApplied(false)
    try {
      await i18n.changeLanguage(language)
      setApplied(true)
    } catch {
      setLanguageError(true)
    } finally {
      setChangingLanguage(false)
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('navigation.settings')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </header>
      <section
        aria-labelledby={`${id}-appearance`}
        className="space-y-5 rounded-xl border bg-card p-5"
      >
        <h2 id={`${id}-appearance`} className="text-lg font-semibold">
          {t('settings.appearance')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label htmlFor={`${id}-theme`} className="text-sm font-medium">
            {t('settings.theme')}
            <select
              id={`${id}-theme`}
              className={controlClass}
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value)
                setApplied(true)
              }}
            >
              <option value="dark">{t('settings.dark')}</option>
              <option value="light">{t('settings.light')}</option>
            </select>
          </label>
          <label htmlFor={`${id}-language`} className="text-sm font-medium">
            {t('settings.language')}
            <select
              id={`${id}-language`}
              className={controlClass}
              value={i18n.resolvedLanguage}
              disabled={changingLanguage}
              onChange={changeLanguage}
            >
              {supportedLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('settings.persistence')}
        </p>
      </section>
      <section
        aria-labelledby={`${id}-sidebar`}
        className="space-y-4 rounded-xl border bg-card p-5"
      >
        <h2 id={`${id}-sidebar`} className="text-lg font-semibold">
          {t('settings.sidebar')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.sidebarDescription')}
        </p>
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <label htmlFor={`${id}-width`} className="text-sm font-medium">
            {t('settings.width')}
            <select
              id={`${id}-width`}
              className={controlClass}
              value={width}
              onChange={(event) => {
                setWidth(Number(event.target.value))
                setApplied(true)
              }}
            >
              {widths.map((value) => (
                <option key={value} value={value}>
                  {value} px
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:mt-7">
            <input
              className="size-4 accent-primary"
              type="checkbox"
              checked={compact}
              onChange={(event) => {
                setCompact(event.target.checked)
                setApplied(true)
              }}
            />
            {t('sidebar.compact')}
          </label>
        </div>
        <SidebarCustomization />
      </section>
      <section
        aria-labelledby={`${id}-workspace`}
        className="space-y-3 rounded-xl border bg-card p-5"
      >
        <h2 id={`${id}-workspace`} className="text-lg font-semibold">
          {t('workspace.local')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.localData')}
        </p>
      </section>
      {languageError && (
        <p role="alert" className="text-sm text-destructive">
          {t('settings.languageFailed')}
        </p>
      )}
      <p
        role="status"
        aria-label={t('settings.feedback')}
        className="text-sm text-muted-foreground"
      >
        {applied ? t('settings.applied') : ''}
      </p>
    </div>
  )
}
export default SettingsPage
