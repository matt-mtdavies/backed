/**
 * Traced from pixel measurements of the "PRIMARY MARK" panel on the
 * approved brand board (the explicitly labeled geometry source of truth):
 * two stacked rounded forms of equal size, ~1.5:1 width:height per form,
 * flat left edges aligned to imply a stem, full semicircular right ends,
 * left-corner radius ~19% of form height, gap ~9% of form height. Do not
 * approximate with text glyphs or CSS bars, and do not eyeball-adjust this
 * ratio without re-measuring the board — this project already got the
 * proportions wrong twice by estimating instead of measuring.
 */
export function BackedMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 150 209" className={className} fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <path d="M19,0 L100,0 A50,50 0 0 1 100,100 L19,100 A19,19 0 0 1 0,81 L0,19 A19,19 0 0 1 19,0 Z" />
      <path d="M19,109 L100,109 A50,50 0 0 1 100,209 L19,209 A19,19 0 0 1 0,190 L0,128 A19,19 0 0 1 19,109 Z" />
    </svg>
  );
}
