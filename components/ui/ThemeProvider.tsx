'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark', toggle: () => {},
})

function resolveTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Inline script run before hydration (in <head>) to apply the persisted/system
 * theme class to <html> immediately. This keeps the server-rendered markup and
 * the initial client render identical (both assume "dark"), avoiding React
 * hydration error #418, while preventing a flash of the wrong theme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.classList.toggle('light',t==='light')}catch(e){}})()`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize to the server default ("dark") so the first client render matches
  // the server-rendered HTML. The real theme is read after mount in the effect
  // below, which then drives all theme-dependent UI consistently.
  const [theme, setTheme] = useState<Theme>('dark')

  // Sync state to the actual resolved theme once, after mount. This reads from
  // external systems (localStorage + matchMedia) that aren't available during
  // SSR, so it must run post-hydration — keeping the first client render equal
  // to the server output (both "dark") to avoid hydration error #418.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveTheme())
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
