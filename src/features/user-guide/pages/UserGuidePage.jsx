import { useEffect, useRef } from 'react'

import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import GuideNavigation from '../components/GuideNavigation'
import GuideContent from '../components/GuideContent'
import { chapters, chapterPath } from '../data/chapters'
import '../data/registerTranslations'

function UserGuidePage() {
  const { t } = useTranslation('guide')
  const { chapterId = 'introduction' } = useParams()
  const { pathname, hash } = useLocation()
  const index = chapters.findIndex((chapter) => chapter.id === chapterId)
  const headingRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const chapter =
    index >= 0 ? t(`chapters.${chapterId}`, { returnObjects: true }) : null

  useEffect(() => {
    // This lazy route focuses only after its own chapter content has rendered.
    const section = hash ? document.getElementById(hash.slice(1)) : null
    const target = section ?? headingRef.current
    target?.focus({ preventScroll: true })
    if (section) section.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [pathname, hash])

  function closeMenu() {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false
    headingRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <a
        href="#guide-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-card focus:p-3"
      >
        {t('skip')}
      </a>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <Link
          to="/guide"
          className="flex items-center gap-2 rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BookOpen aria-hidden="true" className="size-5 text-primary" />
          {t('title')}
        </Link>
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/app">
            <ArrowLeft aria-hidden="true" />
            {t('return')}
          </Link>
        </Button>
      </div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden self-start lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <GuideNavigation activeId={chapterId} />
        </aside>
        <div className="min-w-0">
          <details
            ref={mobileMenuRef}
            className="mb-8 rounded-xl border bg-card lg:hidden"
          >
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl p-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring">
              {t('menu')}
              <ChevronDown aria-hidden="true" className="size-4" />
            </summary>
            <div className="max-h-[60dvh] overflow-y-auto p-3">
              <GuideNavigation activeId={chapterId} onNavigate={closeMenu} />
            </div>
          </details>
          <article
            id="guide-content"
            tabIndex={-1}
            className="mx-auto min-w-0 max-w-3xl scroll-mt-40"
          >
            <header className="mb-8 space-y-4">
              <p className="text-xs font-medium tracking-widest text-primary uppercase">
                {t('title')}
                {index >= 0 ? ` / ${chapters[index].number}` : ''}
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="rounded text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
              >
                {chapter?.title ?? t('notFound')}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                {chapter?.intro ?? t('notFoundText')}
              </p>
            </header>
            {chapter && (
              <>
                {chapter.sections.length > 1 && (
                  <nav
                    aria-label={t('onThisPage')}
                    className="mb-10 border-l-2 border-primary/30 pl-4"
                  >
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                      {t('onThisPage')}
                    </p>
                    <ul className="space-y-2">
                      {chapter.sections.map((section) => (
                        <li key={section.id}>
                          <Link
                            to={`#${section.id}`}
                            className="rounded text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {section.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                <GuideContent
                  chapterId={chapterId}
                  sections={chapter.sections}
                />
                <nav
                  aria-label={t('chaptersLabel')}
                  className="mt-12 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2"
                >
                  {index > 0 && (
                    <Link
                      to={chapterPath(chapters[index - 1].id)}
                      className="rounded-lg border p-4 text-sm hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        {t('previous')}
                      </span>{' '}
                      {t(`chapters.${chapters[index - 1].id}.title`)}
                    </Link>
                  )}
                  {index < chapters.length - 1 && (
                    <Link
                      to={chapterPath(chapters[index + 1].id)}
                      className="rounded-lg border p-4 text-sm hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
                    >
                      <span className="mb-2 flex items-center gap-2 text-muted-foreground">
                        {t('next')}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>{' '}
                      {t(`chapters.${chapters[index + 1].id}.title`)}
                    </Link>
                  )}
                </nav>
              </>
            )}
            <div className="mt-10 border-t pt-8">
              <Button asChild className="min-h-11">
                <Link to="/app">
                  {t('open')}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
export default UserGuidePage
