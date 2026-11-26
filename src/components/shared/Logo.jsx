import { Link } from 'react-router'

import { cn } from '@/lib/utils'

function Logo({ className }) {
  return (
    <Link
      to="/"
      aria-label="Saturnino home"
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-md',
        className,
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="size-9 shrink-0 text-primary"
      >
        <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="2" />

        <ellipse
          cx="20"
          cy="20"
          rx="18"
          ry="6"
          transform="rotate(-32 20 20)"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <span className="text-2xl font-semibold tracking-tight">saturnino.</span>
    </Link>
  )
}

export default Logo
