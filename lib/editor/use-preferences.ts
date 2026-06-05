'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getPreferences, savePreferences } from '@/lib/preferences/actions'
import type { FontFamily } from './types'

type Theme = 'dark' | 'light'

/**
 * Loads the signed-in user's editor preferences once on sign-in and keeps them
 * in sync: theme changes, last-used font (the default for new text), and last
 * zoom level. No-ops entirely when signed out — preferences are an account perk.
 */
export function usePreferences({
  signedIn,
  theme,
  setTheme,
}: {
  signedIn: boolean
  theme: Theme
  setTheme: (t: Theme) => void
}) {
  const [defaultFont, setDefaultFont] = useState<FontFamily | null>(null)
  // Saved zoom as a fraction (e.g. 1 = 100%); read imperatively on doc load.
  const defaultZoomRef = useRef<number | null>(null)
  const loadedRef = useRef(false)
  const lastSavedThemeRef = useRef<Theme | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load on sign-in.
  useEffect(() => {
    if (!signedIn) {
      loadedRef.current = false
      return
    }
    let cancelled = false
    void (async () => {
      const p = await getPreferences()
      if (cancelled) return
      if (p.defaultFont) setDefaultFont(p.defaultFont as FontFamily)
      if (typeof p.defaultZoom === 'number' && p.defaultZoom > 0) {
        defaultZoomRef.current = p.defaultZoom / 100
      }
      if (p.theme === 'light' || p.theme === 'dark') {
        lastSavedThemeRef.current = p.theme
        setTheme(p.theme)
      } else {
        lastSavedThemeRef.current = theme
      }
      loadedRef.current = true
    })()
    return () => {
      cancelled = true
    }
    // Only re-run when sign-in status flips; theme/setTheme are read, not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn])

  // Persist theme when the user changes it (after the initial load).
  useEffect(() => {
    if (!signedIn || !loadedRef.current) return
    if (theme === lastSavedThemeRef.current) return
    lastSavedThemeRef.current = theme
    void savePreferences({ theme })
  }, [theme, signedIn])

  // Remember the last-used font as the default for new text.
  const rememberFont = useCallback(
    (font: FontFamily) => {
      setDefaultFont(font)
      if (signedIn) void savePreferences({ defaultFont: font })
    },
    [signedIn],
  )

  // Remember the last zoom level (debounced; stored as integer percent).
  const rememberZoom = useCallback(
    (fraction: number) => {
      defaultZoomRef.current = fraction
      if (!signedIn) return
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(
        () => void savePreferences({ defaultZoom: Math.round(fraction * 100) }),
        1000,
      )
    },
    [signedIn],
  )

  return { defaultFont, defaultZoomRef, rememberFont, rememberZoom }
}
