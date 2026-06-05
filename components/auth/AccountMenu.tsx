'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { SignOutButton } from './SignOutButton'

/**
 * Account control for the top bar / nav. Callers must only mount this when
 * `authEnabled` is true, so `useSession`'s network request never fires on
 * auth-disabled deployments.
 */
export function AccountMenu() {
  const { data, isPending } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (isPending) {
    return <div aria-hidden="true" className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-elevated)]" />
  }

  if (!data) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
      >
        Sign in
      </Link>
    )
  }

  const email = data.user.email
  const initial = (data.user.name?.trim()?.[0] ?? email?.[0] ?? '?').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-8 w-8 place-items-center rounded-full bg-[var(--btn-accent)] text-sm font-semibold text-white transition-transform hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-panel)] active:scale-[0.96]"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-1.5 shadow-[var(--shadow)]"
        >
          <div className="px-2.5 py-2">
            {data.user.name && (
              <p className="truncate text-sm font-medium text-[var(--text)]">{data.user.name}</p>
            )}
            <p className="truncate text-xs text-[var(--text-muted)]">{email}</p>
          </div>
          <div className="my-1 h-px bg-[var(--border)]" />
          <SignOutButton />
        </div>
      )}
    </div>
  )
}
