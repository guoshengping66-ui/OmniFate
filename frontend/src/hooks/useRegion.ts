"use client"
/**
 * Re-export from RegionContext for backward compatibility.
 * All consumers now share a single region state via the RegionProvider.
 *
 * Detection priority (server → client):
 *   1. "region" cookie set by middleware (CF-IPCountry / Accept-Language)
 *   2. localStorage cache (survives refresh)
 *   3. Browser timezone heuristic
 *   4. Browser language as weak fallback
 */
export { useRegion, type Region } from "@/contexts/RegionContext"
