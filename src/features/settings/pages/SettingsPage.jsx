import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Database, Languages, PanelLeft, HardDrive } from 'lucide-react'
import { Tabs } from 'radix-ui'
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

const categories = [
  ['appearance', 'settings.appearance', Languages],
  ['sidebar', 'settings.sidebar', PanelLeft],
  ['workspace', 'workspace.local', HardDrive],
  ['data', 'dataManagement.title', Database],
]

function SettingRow({ id, label, children }) {
  return (
    <div className="grid min-w-0 items-center gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)] sm:gap-6">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

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
    <div className="min-w-0 max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('navigation.settings')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </header>
      <Tabs.Root defaultValue="appearance" className="space-y-6">
        <Tabs.List
          aria-label={t('settings.categories')}
          className="grid grid-cols-2 gap-1 rounded-xl border bg-muted/40 p-1 sm:grid-cols-4"
        >
          {categories.map(([value, key, Icon]) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="wrap-anywhere">{t(key)}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content
          value="appearance"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <section
            aria-labelledby={`${id}-appearance`}
            className="rounded-xl border bg-card px-5 sm:px-6"
          >
            <header className="border-b py-5">
              <h2 id={`${id}-appearance`} className="text-base font-semibold">
                {t('settings.appearance')}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t('settings.persistence')}
              </p>
            </header>
            <div className="divide-y">
              <SettingRow id={`${id}-theme`} label={t('settings.theme')}>
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
              </SettingRow>
              <SettingRow id={`${id}-language`} label={t('settings.language')}>
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
              </SettingRow>
            </div>
          </section>
        </Tabs.Content>
        <Tabs.Content
          value="sidebar"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <section
            aria-labelledby={`${id}-sidebar`}
            className="rounded-xl border bg-card px-5 sm:px-6"
          >
            <header className="border-b py-5">
              <h2 id={`${id}-sidebar`} className="text-base font-semibold">
                {t('settings.sidebar')}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t('settings.sidebarDescription')}
              </p>
            </header>
            <div className="divide-y">
              <SettingRow id={`${id}-width`} label={t('settings.width')}>
                <Select
                  id={`${id}-width`}
                  value={String(width)}
                  onValueChange={(value) => {
                    setWidth(Number(value))
                    setApplied(true)
                  }}
                  options={widths.map((value) => [
                    String(value),
                    `${value} px`,
                  ])}
                />
              </SettingRow>
              <SettingRow id={`${id}-compact`} label={t('sidebar.compact')}>
                <input
                  id={`${id}-compact`}
                  type="checkbox"
                  className="size-5 accent-primary"
                  checked={compact}
                  onChange={(event) => {
                    setCompact(event.target.checked)
                    setApplied(true)
                  }}
                />
              </SettingRow>
              <div className="py-3">
                <SidebarCustomization />
              </div>
            </div>
            <p className="pb-5 text-xs leading-relaxed text-muted-foreground lg:hidden">
              {t('settings.desktopPreferences')}
            </p>
          </section>
        </Tabs.Content>
        <Tabs.Content
          value="workspace"
          className="space-y-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <section
            aria-labelledby={`${id}-workspace`}
            className="rounded-xl border bg-card p-5 sm:p-6"
          >
            <h2 id={`${id}-workspace`} className="text-base font-semibold">
              {t('workspace.local')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('settings.localData')}
            </p>
          </section>
          <PwaSettingsPanel />
        </Tabs.Content>
        <Tabs.Content
          value="data"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DataManagementPanel />
        </Tabs.Content>
      </Tabs.Root>
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
