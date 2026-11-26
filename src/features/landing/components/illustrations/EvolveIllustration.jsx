const taskPositions = [
  { x: 48, y: 48 },
  { x: 84, y: 48 },
  { x: 48, y: 84 },
  { x: 84, y: 84 },
]

function OrganizeIllustration() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className="mx-auto size-40 text-primary sm:size-48"
      aria-hidden="true"
    >
      {/* Orbital paths */}
      <circle
        cx="80"
        cy="80"
        r="60"
        stroke="currentColor"
        strokeDasharray="3 6"
        opacity="0.4"
      />

      <ellipse
        cx="80"
        cy="80"
        rx="65"
        ry="29"
        transform="rotate(-35 80 80)"
        stroke="currentColor"
        opacity="0.5"
      />

      {/* Organized task cards */}
      {taskPositions.map(({ x, y }) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <rect
            width="28"
            height="28"
            rx="5"
            fill="var(--card)"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M6 10 H22 M6 17 H16"
            stroke="currentColor"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      ))}

      <circle cx="128" cy="44" r="4" fill="currentColor" />
    </svg>
  )
}

export default OrganizeIllustration
