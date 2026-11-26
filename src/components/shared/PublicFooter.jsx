import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import BackToTopButton from '@/components/shared/BackToTopButton'
import Logo from '@/components/shared/Logo'
import SocialLinks from '@/components/shared/SocialLinks'

import { footerNavigation } from '@/features/landing/data/footerNavigation'

const footerLinkClassName =
  'inline-flex w-fit items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground'

function PublicFooter() {
  const { t } = useTranslation('common')

  const currentYear = new Date().getFullYear()
  const newTabLabel = t('accessibility.opensInNewTab')

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Brand and navigation */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] lg:gap-10">
          <div className="space-y-4">
            <Logo />

            <p className="text-sm text-muted-foreground">
              {t('brand.tagline')}
            </p>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {footerNavigation.map(({ id, titleKey, links }) => (
            <nav
              key={id}
              aria-label={t('footer.navigationLabel', {
                section: t(titleKey),
              })}
            >
              <h2 className="mb-4 text-sm font-semibold">{t(titleKey)}</h2>

              <ul className="space-y-3">
                {links.map(({ labelKey, href, external }) => (
                  <li key={href}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLinkClassName}
                      >
                        {t(labelKey)}

                        <ArrowUpRight className="size-3" aria-hidden="true" />

                        <span className="sr-only"> ({newTabLabel})</span>
                      </a>
                    ) : (
                      <Link to={href} className={footerLinkClassName}>
                        {t(labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Developer credits */}
        <div className="flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('footer.designedBy')}{' '}
              <a
                href="https://arafam.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Arafam Mussa Silla
                <span className="sr-only"> ({newTabLabel})</span>
              </a>
            </p>

            <p className="text-xs text-muted-foreground">
              {t('footer.copyright', {
                year: currentYear,
              })}
            </p>
          </div>

          <SocialLinks />
        </div>

        {/* Project signature and back-to-top action */}
        <div className="flex items-center justify-between gap-4 border-t pt-6">
          <p className="text-xs text-muted-foreground italic">
            {t('brand.signature')}
          </p>

          <BackToTopButton />
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
