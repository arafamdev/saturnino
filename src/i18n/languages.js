import englishFlag from '@/assets/icons/flags/en.svg'
import portugueseFlag from '@/assets/icons/flags/pt.svg'

export const DEFAULT_LANGUAGE = 'en'

export const LANGUAGE_STORAGE_KEY = 'saturnino-language'

export const supportedLanguages = [
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flag: englishFlag,
  },
  {
    code: 'pt-PT',
    label: 'Português',
    shortLabel: 'PT',
    flag: portugueseFlag,
  },
]
