import { useTranslation } from 'react-i18next'

function WorkflowStep({ step, stepNumber }) {
  const { t } = useTranslation('landing')

  const { id, icon: StepIcon } = step

  const formattedStepNumber = String(stepNumber).padStart(2, '0')

  return (
    <li className="relative flex flex-col items-center gap-6 text-center">
      {/* Step illustration */}
      <div className="relative flex size-28 items-center justify-center rounded-full border border-primary/20 bg-card sm:size-32">
        <div className="absolute inset-2 rounded-full border border-dashed border-primary/20" />

        <StepIcon
          className="size-10 text-primary sm:size-12"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        <span
          className="absolute -top-1 -right-1 flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {formattedStepNumber}
        </span>
      </div>

      {/* Step content */}
      <div className="max-w-xs space-y-3">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t(`howItWorks.steps.${id}.title`)}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t(`howItWorks.steps.${id}.description`)}
        </p>
      </div>
    </li>
  )
}

export default WorkflowStep
