import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import PwaSettingsPanel from '@/features/pwa/components/PwaSettingsPanel'
import DataManagementPanel from '@/features/data-management/components/DataManagementPanel'
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
  const widths = [
    ...new Set([
      MIN_SIDEBAR_WIDTH,
      DEFAULT_SIDEBAR_WIDTH,
      320,
      MAX_SIDEBAR_WIDTH,
      width,
    ]),
  ].sort((a, b) => a - b)

  async function changeLanguage(language) {
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
    <div className="min-w-0 max-w-4xl space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('navigation.settings')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </header>
      <section
        aria-labelledby={`${id}-appearance`}
        className="space-y-4 rounded-xl border bg-card p-4"
      >
        <h2 id={`${id}-appearance`} className="text-base font-semibold">
          {t('settings.appearance')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${id}-theme`} label={t('settings.theme')}>
            <Select
              id={`${id}-theme`}
              value={theme}
              onValueChange={(value) => {
                setTheme(value)
                setApplied(true)
              }}
              options={['dark', 'light'].map((value) => [
                value,
                t(`settings.${value}`),
              ])}
            />
          </Field>
          <Field id={`${id}-language`} label={t('settings.language')}>
            <Select
              id={`${id}-language`}
              value={i18n.resolvedLanguage}
              disabled={changingLanguage}
              onValueChange={changeLanguage}
              options={supportedLanguages.map((language) => [
                language.code,
                language.label,
              ])}
            />
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('settings.persistence')}
        </p>
      </section>
      <section
        aria-labelledby={`${id}-sidebar`}
        className="space-y-4 rounded-xl border bg-card p-4"
      >
        <h2 id={`${id}-sidebar`} className="text-base font-semibold">
          {t('settings.sidebar')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.sidebarDescription')}
        </p>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field id={`${id}-width`} label={t('settings.width')}>
            <Select
              id={`${id}-width`}
              value={String(width)}
              onValueChange={(value) => {
                setWidth(Number(value))
                setApplied(true)
              }}
              options={widths.map((value) => [String(value), `${value} px`])}
            />
          </Field>
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
        <p className="text-xs text-muted-foreground lg:hidden">
          {t('settings.desktopPreferences')}
        </p>
        <SidebarCustomization />
      </section>
      <section
        aria-labelledby={`${id}-workspace`}
        className="space-y-3 rounded-xl border bg-card p-4"
      >
        <h2 id={`${id}-workspace`} className="text-base font-semibold">
          {t('workspace.local')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.localData')}
        </p>
      </section>
      <DataManagementPanel />
      <PwaSettingsPanel />
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
