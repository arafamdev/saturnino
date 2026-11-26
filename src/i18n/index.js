import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enLanding from './locales/en/landing.json'
import ptLanding from './locales/pt-PT/landing.json'

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
      landing: enLanding,
    },
    'pt-PT': {
      common: ptCommon,
      landing: ptLanding,
    },
  },
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: supportedLanguageCodes,
  defaultNS: 'common',
  ns: ['common', 'landing'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
