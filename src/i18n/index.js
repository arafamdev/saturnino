import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  supportedLanguages,
} from './languages'

import enCommon from './locales/en/common.json'
import ptCommon from './locales/pt-PT/common.json'

const supportedLanguageCodes = supportedLanguages.map(
  (language) => language.code,
)

function getStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)

    if (supportedLanguageCodes.includes(storedLanguage)) {
      return storedLanguage
    }
  } catch {
    // Use the default language when storage is unavailable.
  }

  return DEFAULT_LANGUAGE
}

function synchronizeLanguage(language) {
  document.documentElement.lang = language

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Keep language switching available without storage.
  }
}

i18n.on('languageChanged', synchronizeLanguage)

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
    },
    'pt-PT': {
      common: ptCommon,
    },
  },
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: supportedLanguageCodes,
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
