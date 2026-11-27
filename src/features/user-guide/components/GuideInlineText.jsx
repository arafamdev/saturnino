import { Trans } from 'react-i18next'

import {
  taskPriorityClasses,
  taskStatusClasses,
} from '@/features/tasks/data/taskAppearance'

function GuideAction({ children }) {
  return (
    <strong className="rounded-sm bg-primary/10 px-1 py-0.5 font-semibold text-foreground [box-decoration-break:clone]">
      {children}
    </strong>
  )
}

function GuideLabel({ children }) {
  return <strong className="font-semibold text-foreground">{children}</strong>
}

function GuideStatus({ children, value }) {
  return (
    <strong className="font-semibold text-foreground">
      <span
        aria-hidden="true"
        className={`mr-1 inline-block size-2 rounded-full ${taskStatusClasses[value] ?? ''}`}
      />
      {children}
    </strong>
  )
}

function GuidePriority({ children, value }) {
  return (
    <strong
      className={`font-semibold ${taskPriorityClasses[value] ?? 'text-foreground'}`}
    >
      {children}
    </strong>
  )
}

export function GuidePath({ children }) {
  return <span className="font-medium text-foreground">{children}</span>
}

const components = {
  action: <GuideAction />,
  label: <GuideLabel />,
  status: <GuideStatus />,
  priority: <GuidePriority />,
  example: <em className="text-foreground" />,
  key: (
    <kbd className="rounded border bg-muted px-1 font-mono text-[0.9em] text-foreground" />
  ),
  path: <GuidePath />,
}

// Trans maps authored translation tags to React elements; no HTML is injected.
export default function GuideInlineText({ children }) {
  return (
    <Trans
      ns="guide"
      i18nKey={null}
      defaults={children}
      components={components}
    />
  )
}
