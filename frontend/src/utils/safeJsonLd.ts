"use client"

/**
 * safeJsonLd — Escape </script> in inline JSON-LD to prevent XSS.
 *
 * Usage:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
 */
export function safeJsonLd(obj: object): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
