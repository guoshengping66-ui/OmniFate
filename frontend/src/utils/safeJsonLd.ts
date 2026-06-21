/**
 * safeJsonLd — Escape </script> in inline JSON-LD to prevent XSS.
 *
 * SECURITY: This function escapes <, >, and & characters to prevent XSS attacks
 * via malicious script injection in JSON-LD content. Always use this when
 * rendering JSON-LD with dangerouslySetInnerHTML.
 *
 * Usage:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
 *
 * NOTE: Data passed to this function should be hardcoded or from trusted sources.
 * Never pass user-controlled input directly to JSON-LD without validation.
 */
export function safeJsonLd(obj: object): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
