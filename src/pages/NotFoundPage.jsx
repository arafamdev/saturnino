import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-6xl font-semibold text-primary">404</h1>

      <p className="text-xl font-medium">Page not found</p>

      <p className="text-muted-foreground">This page is outside our orbit.</p>

      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  )
}

export default NotFoundPage
