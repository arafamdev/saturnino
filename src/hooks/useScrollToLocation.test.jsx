import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'

import useScrollToLocation from './useScrollToLocation'

function ScrollTestPage() {
  useScrollToLocation()

  return (
    <>
      <nav>
        <Link to="/#features">Features</Link>
        <Link to="/about">About</Link>
      </nav>

      <section id="features">Features section</section>
    </>
  )
}

function renderScrollPage(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollTestPage />
    </MemoryRouter>,
  )
}

describe('useScrollToLocation', () => {
  it('scrolls to the top when no hash is provided', () => {
    renderScrollPage('/')

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })
  })

  it('scrolls to the section matching the URL hash', () => {
    renderScrollPage('/#features')

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
    })

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top when the target section does not exist', () => {
    renderScrollPage('/#unknown-section')

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })
  })

  it('scrolls to a section after hash navigation', async () => {
    const user = userEvent.setup()

    renderScrollPage('/about')

    vi.clearAllMocks()

    await user.click(
      screen.getByRole('link', {
        name: 'Features',
      }),
    )

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
    })

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top after page navigation', async () => {
    const user = userEvent.setup()

    renderScrollPage('/#features')

    vi.clearAllMocks()

    await user.click(
      screen.getByRole('link', {
        name: 'About',
      }),
    )

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
