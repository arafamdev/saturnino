import { ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'

function BackToTopButton() {
  function handleScrollToTop() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    })
  }

  return (
    <div className="flex w-fit flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 rounded-full border-primary/30 text-primary transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
        onClick={handleScrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </Button>

      <span className="text-xs text-muted-foreground" aria-hidden="true">
        Back to top
      </span>
    </div>
  )
}

export default BackToTopButton
