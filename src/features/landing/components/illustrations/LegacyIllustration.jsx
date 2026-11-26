function LegacyIllustration() {
  return (
    <svg
      viewBox="0 0 340 180"
      fill="none"
      className="mx-auto w-full max-w-sm text-primary"
      aria-hidden="true"
    >
      {/* Outer orbital paths */}
      <circle
        cx="170"
        cy="90"
        r="74"
        stroke="currentColor"
        strokeDasharray="2 7"
        opacity="0.25"
      />

      <circle cx="170" cy="90" r="58" stroke="currentColor" opacity="0.15" />

      <ellipse
        cx="170"
        cy="90"
        rx="112"
        ry="35"
        transform="rotate(-25 170 90)"
        stroke="currentColor"
        opacity="0.35"
      />

      {/* Central planet */}
      <circle
        cx="170"
        cy="90"
        r="35"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <ellipse
        cx="170"
        cy="90"
        rx="57"
        ry="15"
        transform="rotate(-25 170 90)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Surrounding stars */}
      <circle cx="265" cy="45" r="3" fill="currentColor" />

      <circle cx="100" cy="130" r="2" fill="currentColor" opacity="0.6" />

      <path
        d="M80 38 V50 M74 44 H86 M260 130 V138 M256 134 H264"
        stroke="currentColor"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

export default LegacyIllustration
