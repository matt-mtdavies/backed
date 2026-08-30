// Unicode arrow glyphs (↗ → ←) fall back to Apple Color Emoji on iOS/macOS
// Safari when the active webfont has no glyph for that code point, rendering
// as a colored icon-in-a-box instead of a thin text arrow. An inline SVG
// sidesteps font fallback entirely, so it renders identically everywhere.
const ROTATION = { e: 0, ne: -45, w: 180 } as const;

export function Arrow({ direction = "e", className }: { direction?: keyof typeof ROTATION; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: ROTATION[direction] ? `rotate(${ROTATION[direction]}deg)` : undefined, flexShrink: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  );
}
