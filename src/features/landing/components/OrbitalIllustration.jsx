function OrbitalIllustration() {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-md text-primary"
    >
      {/* Outer orbits */}
      <g stroke="currentColor" strokeWidth="1">
        <ellipse
          cx="200"
          cy="140"
          rx="160"
          ry="65"
          transform="rotate(-20 200 140)"
          strokeDasharray="5 8"
          opacity=".35"
        />

        <ellipse
          cx="200"
          cy="140"
          rx="100"
          ry="120"
          transform="rotate(35 200 140)"
          opacity=".2"
        />
      </g>

      {/* Central planet */}
      <circle
        cx="200"
        cy="140"
        r="58"
        fill="var(--card)"
        stroke="currentColor"
        strokeWidth="2"
      />

      <ellipse
        cx="200"
        cy="140"
        rx="92"
        ry="23"
        transform="rotate(-32 200 140)"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Orbital satellites */}
      <g fill="currentColor">
        <circle cx="75" cy="105" r="5" />
        <circle cx="318" cy="175" r="7" />
        <circle cx="260" cy="43" r="3" />
        <circle cx="125" cy="240" r="3" />
      </g>
    </svg>
  )
}

export default OrbitalIllustration
