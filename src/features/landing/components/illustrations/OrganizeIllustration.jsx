const progressPoints = [
  { x: 40, y: 113 },
  { x: 68, y: 88 },
  { x: 97, y: 67 },
  { x: 128, y: 35 },
]

function EvolveIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className="mx-auto size-40 text-primary sm:size-48"
      aria-hidden="true"
    >
      <circle
        cx="80"
        cy="80"
        r="60"
        stroke="currentColor"
        strokeDasharray="3 6"
        opacity="0.4"
      />

      {/* Progress axes */}
      <path
        d="M35 35 V125 H130"
        stroke="currentColor"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Growth trajectory */}
      <path
        d="M40 113 Q57 113 68 88 T97 67 T128 35"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {progressPoints.map(({ x, y }) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="5"
          fill="var(--card)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}

      <path
        d="M115 35 H128 V48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default EvolveIllustration
