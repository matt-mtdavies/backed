/**
 * Traced from the approved brand board: two stacked rounded forms of equal
 * size, flat left edges aligned to imply a stem, full semicircular right
 * ends. Do not approximate with text glyphs or CSS bars — this path
 * geometry is the source of truth.
 */
export function BackedMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 194" className={className} fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <path d="M13,0 L55,0 A45,45 0 0 1 55,90 L13,90 A13,13 0 0 1 0,77 L0,13 A13,13 0 0 1 13,0 Z" />
      <path d="M13,104 L55,104 A45,45 0 0 1 55,194 L13,194 A13,13 0 0 1 0,181 L0,117 A13,13 0 0 1 13,104 Z" />
    </svg>
  );
}
