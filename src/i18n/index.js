import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  supportedLanguages,
} from './languages'

import enCommon from './locales/en/common.json'
import enLanding from './locales/en/landing.json'
import enAbout from './locales/en/about.json'
import enApp from './locales/en/app.json'

import ptCommon from './locales/pt-PT/common.json'
import ptLanding from './locales/pt-PT/landing.json'
import ptAbout from './locales/pt-PT/about.json'
import ptApp from './locales/pt-PT/app.json'

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
      about: enAbout,
      app: enApp,
    },
    'pt-PT': {
      common: ptCommon,
      landing: ptLanding,
      about: ptAbout,
      app: ptApp,
    },
  },
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: supportedLanguageCodes,
  defaultNS: 'common',
  ns: ['common', 'landing', 'about', 'app'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
