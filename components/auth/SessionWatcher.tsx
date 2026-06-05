'use client'

import { useEffect } from 'react'
import { useSession } from '@/lib/auth-client'

/**
 * Reports sign-in status to a parent via `onChange`. Calls `useSession()`, which
 * hits /api/auth/get-session — a request that 503s on auth-disabled deployments.
 * So callers must render this ONLY when auth is enabled; it renders nothing.
 */
export function SessionWatcher({ onChange }: { onChange: (signedIn: boolean) => void }) {
  const { data } = useSession()
  const signedIn = Boolean(data)
  useEffect(() => {
    onChange(signedIn)
  }, [signedIn, onChange])
  return null
}
