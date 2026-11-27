import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Hash } from 'lucide-react'

import GuideFigure from './GuideFigure'
import GuideInlineText from './GuideInlineText'
import GuideFaq from './GuideFaq'
import InstallInstructions from './InstallInstructions'
import WorkspaceDiagram from './WorkspaceDiagram'

function GuideContent({ chapterId, sections }) {
  const { t } = useTranslation('guide')
  return sections.map((section) => (
    <section
      key={section.id}
      aria-labelledby={section.id}
      className="mb-10 space-y-4"
    >
      <h2
        id={section.id}
        tabIndex={-1}
        className="flex scroll-mt-40 items-start gap-2 rounded text-xl font-semibold tracking-tight outline-none sm:text-2xl"
      >
        {section.title}
        <Link
          to={`#${section.id}`}
          aria-label={`${t('permalink')}: ${section.title}`}
          className="shrink-0 rounded p-1 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Hash aria-hidden="true" className="size-4" />
        </Link>
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="text-base leading-8 text-muted-foreground"
        >
          <GuideInlineText>{paragraph}</GuideInlineText>
        </p>
      ))}
      {section.steps.length > 0 && (
        <ol className="list-decimal space-y-4 pl-6 text-base leading-8 text-muted-foreground">
          {section.steps.map((step) => (
            <li key={step} className="pl-2">
              <GuideInlineText>{step}</GuideInlineText>
            </li>
          ))}
        </ol>
      )}
      {section.bullets.length > 0 && (
        <ul className="list-disc space-y-3 pl-6 text-base leading-8 text-muted-foreground">
          {section.bullets.map((item) => (
            <li key={item} className="pl-2">
              <GuideInlineText>{item}</GuideInlineText>
            </li>
          ))}
        </ul>
      )}
      {['warning', 'note'].map(
        (kind) =>
          section[kind] && (
            <aside
              key={kind}
              className={`rounded-lg border-l-4 p-4 text-sm leading-7 ${kind === 'warning' ? 'border-destructive bg-destructive/5 text-foreground' : 'border-primary/40 bg-muted/40 text-muted-foreground'}`}
            >
              <p className="mb-1 font-semibold text-foreground">{t(kind)}</p>
              <GuideInlineText>{section[kind]}</GuideInlineText>
            </aside>
          ),
      )}
      {section.figure && <GuideFigure name={section.figure} />}
      {chapterId === 'installation' && section.id === 'platforms' && (
        <InstallInstructions />
      )}
      {chapterId === 'local-first' && section.id === 'devices' && (
        <WorkspaceDiagram />
      )}
      {chapterId === 'future' && section.id === 'now-next' && (
        <>
          <WorkspaceDiagram />
          <WorkspaceDiagram future />
        </>
      )}
      {chapterId === 'faq' && <GuideFaq />}
    </section>
  ))
}
export default GuideContent
