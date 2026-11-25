import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

function LandingPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Bring your work into orbit.
      </h1>

      <p className="text-muted-foreground">Everything in its orbit.</p>

      <Button asChild>
        <Link to="/app">Open Saturnino</Link>
      </Button>
    </section>
  )
}

export default LandingPage
