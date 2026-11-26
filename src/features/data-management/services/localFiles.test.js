import { afterEach, expect, it, vi } from 'vitest'
import { downloadTextFile, readFileText } from './localFiles'
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('cleans up the temporary anchor and releases its Blob URL', () => {
  vi.useFakeTimers()
  const create = vi.fn(() => 'blob:qa-download'),
    revoke = vi.fn()
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create
      static revokeObjectURL = revoke
    },
  )
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  downloadTextFile('QA', 'text/plain', 'qa.txt')
  expect(create).toHaveBeenCalledWith(expect.any(Blob))
  expect(click).toHaveBeenCalledOnce()
  expect(document.querySelector('a[download="qa.txt"]')).not.toBeInTheDocument()
  vi.advanceTimersByTime(1000)
  expect(revoke).toHaveBeenCalledWith('blob:qa-download')
})
it('reads UTF-8 content through the File API', async () => {
  expect(
    await readFileText(
      new File(['Árvore'], 'qa.json', { type: 'application/json' }),
    ),
  ).toBe('Árvore')
})
