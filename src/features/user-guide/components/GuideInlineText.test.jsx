import { act, render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import i18n from '@/i18n'
import enApp from '@/i18n/locales/en/app.json'
import ptApp from '@/i18n/locales/pt-PT/app.json'
import '../data/registerTranslations'
import en from '../data/en.json'
import pt from '../data/pt-PT.json'
import GuideInlineText from './GuideInlineText'

function bodyStrings(guide) {
  return [
    ...Object.values(guide.chapters).flatMap((chapter) =>
      chapter.sections.flatMap((section) => [
        ...section.paragraphs,
        ...section.steps,
        ...section.bullets,
        ...[section.warning, section.note].filter(Boolean),
      ]),
    ),
    ...guide.faq.map(({ answer }) => answer),
    ...guide.platforms.flatMap(({ steps }) => steps),
    ...Object.values(guide.figures).map(({ caption }) => caption),
  ]
}

function leaves(value) {
  return typeof value === 'string'
    ? [value]
    : Object.values(value).flatMap(leaves)
}

const browserLabels = {
  en: [
    'Share',
    'Add to Dock',
    'File',
    'More',
    'Cast, save, and share',
    'Install page as app',
    'App available',
    'Install',
    'Add to Home Screen',
    'Open as Web App',
    'Add',
    'View More',
    'Install and create shortcut',
    'Install app',
    'Add to Home screen',
    'English',
    'Português',
  ],
  'pt-PT': [
    'Partilhar',
    'Adicionar à Dock',
    'Ficheiro',
    'Mais',
    'Transmitir, guardar e partilhar',
    'Instalar página como aplicação',
    'Instalar',
    'Adicionar ao ecrã principal',
    'Abrir como aplicação web',
    'Adicionar',
    'Ver mais',
    'Instalar e criar atalho',
    'Instalar aplicação',
    'English',
    'Português',
  ],
}

it.each([
  ['en', en, enApp],
  ['pt-PT', pt, ptApp],
])(
  'renders every authored body in %s with exact UI labels and no visible markers',
  async (language, guide, app) => {
    await act(() => i18n.changeLanguage(language))
    const errors = vi.spyOn(console, 'error')
    const strings = bodyStrings(guide)
    const { container } = render(
      <>
        {strings.map((text, index) => (
          <p key={index}>
            <GuideInlineText>{text}</GuideInlineText>
          </p>
        ))}
      </>,
    )
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
    const vocabulary = new Set([...leaves(app), ...browserLabels[language]])
    strings.forEach((text, index) => {
      const paragraph = container.children[index]
      expect(paragraph.textContent).toBe(text.replace(/<[^>]+>/g, ''))
      const xml = new DOMParser().parseFromString(
        `<root>${text.replaceAll('&', '&amp;')}</root>`,
        'text/xml',
      )
      expect(xml.querySelector('parsererror')).toBeNull()
      for (const node of xml.querySelectorAll('*')) {
        expect([
          'root',
          'action',
          'label',
          'status',
          'priority',
          'example',
          'key',
          'path',
        ]).toContain(node.tagName)
        if (['action', 'label', 'status', 'priority'].includes(node.tagName)) {
          expect(
            vocabulary.has(node.textContent),
            `${language}: ${node.textContent}`,
          ).toBe(true)
        }
        if (['status', 'priority'].includes(node.tagName)) {
          expect(app.tasks[node.tagName][node.getAttribute('value')]).toBe(
            node.textContent,
          )
        }
        if (node.tagName === 'path') {
          expect(node.children.length).toBeGreaterThanOrEqual(2)
          expect(node.textContent).toContain(' → ')
        }
      }
    })
    expect(container.querySelectorAll('strong').length).toBeGreaterThan(80)
    expect(container.querySelectorAll('em').length).toBeGreaterThan(3)
    expect(container.querySelectorAll('kbd').length).toBeGreaterThan(4)
    expect(
      container.querySelector('button, a, [tabindex], [role="button"]'),
    ).toBeNull()
  },
)

it('renders nested navigation references and keyboard input as selectable, noninteractive text', () => {
  const { container } = render(
    <GuideInlineText>
      {
        '<path><label>Settings</label> → <label>Data management</label> → <action>Download JSON backup</action></path>. Press <key>Escape</key>.'
      }
    </GuideInlineText>,
  )
  expect(container.querySelectorAll('strong')).toHaveLength(3)
  expect(container.querySelector('kbd')).toHaveTextContent('Escape')
  expect(container.textContent).toBe(
    'Settings → Data management → Download JSON backup. Press Escape.',
  )
  expect(container.querySelector('[tabindex], button, a')).toBeNull()
})
