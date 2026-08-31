const TONES = ["lime", "bone", "mist"] as const;

export function toneForIndex(index: number): (typeof TONES)[number] {
  return TONES[index % TONES.length];
}

export function relativeDaysAgoLabel(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const days = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
  if (days === 0) return "BACKED TODAY.";
  if (days === 1) return "BACKED YESTERDAY.";
  return `BACKED ${days} DAYS AGO.`;
}
