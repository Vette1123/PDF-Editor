'use client'

import { useEffect, useState } from 'react'

/**
 * Client-only media-query hook. Guards `window` so it is safe even though the
 * editor is loaded with `ssr:false`. Returns `false` until mounted to keep the
 * first client render deterministic.
 *
 * Prefer pure CSS responsive utilities where possible; use this only when JS
 * needs to branch on viewport (e.g. mounting a bottom sheet vs. a side aside).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
