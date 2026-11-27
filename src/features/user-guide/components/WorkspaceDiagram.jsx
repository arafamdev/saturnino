import { Cloud, Laptop, Smartphone, Tablet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const icons = [Laptop, Tablet, Smartphone]

function WorkspaceDiagram({ future = false }) {
  const { t } = useTranslation('guide')
  return (
    <figure className="my-8 rounded-xl border bg-muted/30 p-5">
      <figcaption className="mb-5 text-sm font-medium">
        {t(future ? 'futureLabel' : 'current')}{' '}
        <span className="block text-xs font-normal text-muted-foreground">
          {t('diagramLabel')}
        </span>
      </figcaption>
      {future && (
        <div className="mb-5 flex flex-col items-center gap-2 text-center text-sm">
          <Cloud aria-hidden="true" className="text-primary" />
          <p>{t('futureDiagram')}</p>
          <span aria-hidden="true">↓</span>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {icons.map((Icon, index) => (
          <li
            key={index}
            className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3 text-sm"
          >
            <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
            <span>{t(`deviceLabels.${index}`)}</span>
          </li>
        ))}
      </ul>
      {!future && (
        <p className="mt-4 text-sm text-muted-foreground">{t('independent')}</p>
      )}
    </figure>
  )
}
export default WorkspaceDiagram
