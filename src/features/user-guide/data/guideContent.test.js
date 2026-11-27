import { expect, it } from 'vitest'

import { chapters } from './chapters'
import en from './en.json'
import pt from './pt-PT.json'

const figures = import.meta.glob('../assets/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function shape(value) {
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shape(item)]),
    )
  return typeof value
}

it('covers all 15 chapters and matching complete language structures', () => {
  expect(chapters).toHaveLength(15)
  expect(new Set(chapters.map((x) => x.id)).size).toBe(15)
  expect(Object.keys(en.chapters).sort()).toEqual(
    chapters.map((x) => x.id).sort(),
  )
  expect(shape(pt)).toEqual(shape(en))
  for (const chapter of chapters) {
    for (const section of en.chapters[chapter.id].sections) {
      if (section.figure)
        expect(figures[`../assets/guide-${section.figure}.webp`]).toBeTruthy()
    }
    expect(en.chapters[chapter.id].sections.length).toBeGreaterThan(0)
    expect(pt.chapters[chapter.id].sections.map((s) => s.id)).toEqual(
      en.chapters[chapter.id].sections.map((s) => s.id),
    )
    expect(
      new Set(en.chapters[chapter.id].sections.map((s) => s.id)).size,
    ).toBe(en.chapters[chapter.id].sections.length)
  }
  expect(en.faq).toHaveLength(14)
  expect(en.platforms).toHaveLength(5)
})
