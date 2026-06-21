/**
 * Safely serialize JSON for use in dangerouslySetInnerHTML inline scripts.
 * Escapes </script> tags to prevent XSS via script injection.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
