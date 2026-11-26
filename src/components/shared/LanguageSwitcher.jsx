import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'

import { Button } from '@/components/ui/button'

import { DEFAULT_LANGUAGE, supportedLanguages } from '@/i18n/languages'

import { cn } from '@/lib/utils'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')

  const currentLanguage =
    supportedLanguages.find(
      (language) => language.code === i18n.resolvedLanguage,
    ) ??
    supportedLanguages.find((language) => language.code === DEFAULT_LANGUAGE)

  function handleLanguageChange(languageCode) {
    return i18n.changeLanguage(languageCode)
  }

  return (
    <>
      {/* Desktop and tablet language switcher */}
      <div
        role="group"
        aria-label={t('language.changeLanguage')}
        className="hidden h-11 shrink-0 items-center gap-1 rounded-lg border bg-background p-1 md:flex"
      >
        {supportedLanguages.map((language) => {
          const isActive = currentLanguage.code === language.code

          return (
            <button
              key={language.code}
              type="button"
              lang={language.code}
              aria-label={language.label}
              aria-pressed={isActive}
              title={language.label}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                'flex h-full w-9 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                isActive ? 'bg-accent shadow-sm' : 'hover:bg-muted',
              )}
            >
              <img
                src={language.flag}
                alt=""
                className="h-4 w-5 rounded-xs object-cover"
              />
            </button>
          )
        })}
      </div>

      {/* Mobile language dropdown */}
      <div className="md:hidden">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 px-3"
              aria-label={t('language.changeLanguage')}
            >
              <img
                src={currentLanguage.flag}
                alt=""
                className="h-4 w-5 rounded-xs object-cover"
              />

              <ChevronDown
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-60 min-w-44 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
            >
              <DropdownMenu.RadioGroup
                value={currentLanguage.code}
                onValueChange={handleLanguageChange}
              >
                {supportedLanguages.map((language) => (
                  <DropdownMenu.RadioItem
                    key={language.code}
                    value={language.code}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  >
                    <img
                      src={language.flag}
                      alt=""
                      className="h-4 w-5 rounded-xs object-cover"
                    />

                    <span lang={language.code}>{language.label}</span>

                    <DropdownMenu.ItemIndicator className="ml-auto">
                      <Check
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </>
  )
}

export default LanguageSwitcher
