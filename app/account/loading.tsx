import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

/**
 * Instant-navigation skeleton for /account.
 *
 * The account page awaits a session lookup plus three DB queries before it can
 * stream any HTML. Without a loading boundary, App Router keeps the user stuck
 * on the previous page until all of that resolves. This skeleton renders
 * immediately on navigation and mirrors the real layout (header + profile +
 * section cards) so the swap is seamless.
 */

function Pulse({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-[var(--bg-elevated)] ${className}`} />
}

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <Pulse className="h-9 w-9 shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-52" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Pulse key={i} className="h-10 w-full" />
        ))}
      </div>
    </section>
  )
}

export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-canvas)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            aria-label="Signet home"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <Logo className="text-[15px]" />
          </Link>
          <div className="flex items-center gap-2">
            <Pulse className="h-9 w-32" />
            <Pulse className="h-9 w-32" />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8" role="status" aria-label="Loading your account">
        {/* Profile identity block */}
        <div className="mb-8 flex items-center gap-4">
          <Pulse className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-3.5 w-56" />
          </div>
        </div>

        {/* Section cards: signatures, recent documents, preferences */}
        <div className="space-y-5">
          <SectionSkeleton rows={3} />
          <SectionSkeleton rows={2} />
          <SectionSkeleton rows={2} />
        </div>
        <span className="sr-only">Loading your account…</span>
      </div>
    </main>
  )
}
