import { describe, expect, it } from 'vitest'

import enCommon from './locales/en/common.json'
import enLanding from './locales/en/landing.json'
import enAbout from './locales/en/about.json'
import enApp from './locales/en/app.json'

import ptCommon from './locales/pt-PT/common.json'
import ptLanding from './locales/pt-PT/landing.json'
import ptAbout from './locales/pt-PT/about.json'
import ptApp from './locales/pt-PT/app.json'

const translationNamespaces = [
  ['common', enCommon, ptCommon],
  ['landing', enLanding, ptLanding],
  ['about', enAbout, ptAbout],
  ['app', enApp, ptApp],
]

function getTranslationKeys(translations, parentKey = '') {
  return Object.entries(translations).flatMap(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key

    // Traverse nested translation objects recursively.
    if (value !== null && typeof value === 'object') {
      return getTranslationKeys(value, fullKey)
    }

    return [fullKey]
  })
}

describe('Translation resources', () => {
  it.each(translationNamespaces)(
    'provides matching translation keys for the %s namespace',
    (_, englishTranslations, portugueseTranslations) => {
      const englishKeys = getTranslationKeys(englishTranslations).sort()

      const portugueseKeys = getTranslationKeys(portugueseTranslations).sort()

      expect(portugueseKeys).toEqual(englishKeys)
    },
  )
})
