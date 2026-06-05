'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// AccountMenu uses better-auth's useSession (a browser-only client hook) that
// cannot be statically prerendered — rendering it during SSG of the landing
// page crashes the build. Load it client-only so it mounts after hydration.
const AccountMenu = dynamic(
  () => import('@/components/auth/AccountMenu').then((m) => m.AccountMenu),
  {
    ssr: false,
    // Reserve the avatar's footprint from first paint so the chunk loading +
    // session fetch never shift the nav (skeleton -> avatar, same size).
    loading: () => (
      <div aria-hidden="true" className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-elevated)]" />
    ),
  },
)

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav({ authEnabled = false }: { authEnabled?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-canvas)_82%,transparent)] backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Signet home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
          <Logo className="text-[15px]" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {authEnabled && <AccountMenu />}
          <Link
            href="/editor"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--btn-accent)] px-3.5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] active:scale-[0.98]"
          >
            Open editor
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </nav>
    </header>
  )
}
