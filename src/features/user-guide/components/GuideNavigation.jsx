import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { chapters, chapterPath } from '../data/chapters'

function GuideNavigation({ activeId, onNavigate }) {
  const { t } = useTranslation('guide')
  return (
    <nav aria-label={t('chaptersLabel')} className="space-y-6">
      {t('groups', { returnObjects: true }).map((group, groupIndex) => (
        <div key={group}>
          <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {group}
          </h2>
          <ol className="space-y-1">
            {chapters
              .filter((chapter) => chapter.group === groupIndex)
              .map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    to={chapterPath(chapter.id)}
                    onClick={onNavigate}
                    aria-current={activeId === chapter.id ? 'page' : undefined}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:bg-primary/10 aria-[current=page]:font-medium aria-[current=page]:text-primary"
                  >
                    <span className="text-xs tabular-nums">
                      {chapter.number}
                    </span>{' '}
                    <span>{t(`chapters.${chapter.id}.title`)}</span>
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </nav>
  )
}
export default GuideNavigation
