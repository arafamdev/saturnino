import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

import BackToTopButton from '@/components/shared/BackToTopButton'
import Logo from '@/components/shared/Logo'

import {
  footerNavigation,
  socialLinks,
} from '@/features/landing/data/footerNavigation'

const footerLinkClassName =
  'inline-flex w-fit items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground'

function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Brand and navigation */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] lg:gap-10">
          <div className="space-y-4">
            <Logo />

            <p className="text-sm text-muted-foreground">
              Everything in its orbit.
            </p>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A thoughtful space to organize your work,
              <br className="hidden md:block" /> focus on what matters,
              <br className="hidden md:block" /> and make meaningful progress.
            </p>
          </div>

          {footerNavigation.map(({ id, title, links }) => (
            <nav key={id} aria-label={`Footer ${title}`}>
              <h2 className="mb-4 text-sm font-semibold">{title}</h2>

              <ul className="space-y-3">
                {links.map(({ label, href, external }) => (
                  <li key={href}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLinkClassName}
                      >
                        {label}
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <Link to={href} className={footerLinkClassName}>
                        {label}
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
              Designed & developed by{' '}
              <a
                href="https://arafam.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Arafam Mussa Silla
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>

            <p className="text-xs text-muted-foreground">
              © {currentYear} Saturnino.
            </p>
          </div>

          <nav aria-label="Developer social links">
            <ul className="flex flex-wrap items-center gap-5">
              {socialLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClassName}
                  >
                    {label}
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Project signature and back-to-top action */}
        <div className="flex items-center justify-between gap-4 border-t pt-6">
          <p className="text-xs text-muted-foreground italic">
            Built with purpose. Inspired by legacy.
          </p>

          <BackToTopButton />
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
