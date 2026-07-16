export const STATIC_CONTENT_LAST_MODIFIED = new Date("2026-07-17T00:00:00.000Z")

export function getProgrammaticLastModified(sourceDate?: Date): Date {
  return sourceDate ?? STATIC_CONTENT_LAST_MODIFIED
}
