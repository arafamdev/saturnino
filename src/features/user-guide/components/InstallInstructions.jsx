import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { usePwa } from '@/features/pwa/hooks/usePwa'

const sources = [
  'https://support.apple.com/104996',
  'https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux',
  'https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios',
  'https://support.apple.com/guide/ipad/ipad8f1f7a29/ipados',
  'https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid',
]

function InstallInstructions() {
  const { t } = useTranslation('guide')
  const {
    canInstall,
    isInstalled,
    isInstalling,
    installError,
    requestInstall,
  } = usePwa()
  return (
    <div className="space-y-8">
      <div className="space-y-3 rounded-xl border bg-primary/5 p-5">
        {canInstall && (
          <Button
            type="button"
            disabled={isInstalling}
            onClick={requestInstall}
          >
            {t(isInstalling ? 'installing' : 'install')}
          </Button>
        )}
        <p className="text-sm leading-7 text-muted-foreground">
          {t(isInstalled ? 'installed' : 'manual')}
        </p>
        <p role="status" className="text-sm">
          {installError ? t(installError) : ''}
        </p>
      </div>
      {t('platforms', { returnObjects: true }).map(
        ({ title, steps }, index) => (
          <section
            key={title}
            className="space-y-3"
            aria-labelledby={`platform-${index}`}
          >
            <h3 id={`platform-${index}`} className="text-lg font-semibold">
              {title}
            </h3>
            <ol className="list-decimal space-y-3 pl-6 text-sm leading-7 text-muted-foreground">
              {steps.map((step) => (
                <li key={step} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
            <a
              href={sources[index]}
              className="inline-block rounded text-sm text-primary underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('official')} ↗
            </a>
          </section>
        ),
      )}
      <a
        href="https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DDesktop"
        className="text-sm text-primary underline underline-offset-4"
      >
        Chrome · {t('official')} ↗
      </a>
    </div>
  )
}
export default InstallInstructions
