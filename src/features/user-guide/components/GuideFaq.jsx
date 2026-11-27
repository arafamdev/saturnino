import { Accordion } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function GuideFaq() {
  const { t } = useTranslation('guide')
  return (
    <Accordion.Root type="multiple" className="divide-y border-y">
      {t('faq', { returnObjects: true }).map(({ question, answer }, index) => (
        <Accordion.Item key={index} value={String(index)}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-base font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              {question}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-5 text-sm leading-7 text-muted-foreground">
            {answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
export default GuideFaq
