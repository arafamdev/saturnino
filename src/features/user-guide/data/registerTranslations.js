import i18n from '@/i18n'

import en from './en.json'
import pt from './pt-PT.json'

// Loaded with the guide route, not the initial application bundle.
i18n.addResourceBundle('en', 'guide', en, true, true)
i18n.addResourceBundle('pt-PT', 'guide', pt, true, true)
