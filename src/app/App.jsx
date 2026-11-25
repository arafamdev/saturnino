import ThemeToggle from '@/components/shared/ThemeToggle'

function App() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      {/* Theme controls */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Brand identity */}
      <h1 className="text-4xl font-semibold tracking-tight">saturnino.</h1>

      <p className="text-sm text-muted-foreground">Everything in its orbit.</p>
    </main>
  )
}

export default App
