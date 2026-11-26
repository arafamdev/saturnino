const focusRings = [
  { radius: 58, opacity: 0.25 },
  { radius: 43, opacity: 0.45 },
  { radius: 28, opacity: 0.7 },
]

function FocusIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className="mx-auto size-40 text-primary sm:size-48"
      aria-hidden="true"
    >
      {/* Concentric focus rings */}
      {focusRings.map(({ radius, opacity }) => (
        <circle
          key={radius}
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={opacity}
        />
      ))}

      {/* Central focus point */}
      <circle cx="80" cy="80" r="10" fill="currentColor" />

      <path
        d="M80 12 V34 M80 126 V148 M12 80 H34 M126 80 H148"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M119 41 L88 72"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default FocusIllustration
