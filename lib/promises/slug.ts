export function buildPromiseSlug(firstName: string, promiseId: string): string {
  const base = firstName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "promise";
  return `${base}-${promiseId.replace(/-/g, "").slice(0, 8)}`;
}
