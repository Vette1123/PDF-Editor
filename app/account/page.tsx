import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { AccountView } from '@/components/account/AccountView'
import { getSession } from '@/lib/get-session'
import { authConfigured } from '@/lib/env'
import { listSignatures } from '@/lib/signatures/actions'
import { getPreferences } from '@/lib/preferences/actions'
import { listDocuments } from '@/lib/documents/actions'

export const metadata: Metadata = {
  title: 'Profile & settings',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  // Account features require auth. Send signed-out / auth-disabled users to login.
  if (!authConfigured) redirect('/login')
  const session = await getSession()
  if (!session) redirect('/login')

  const [signatures, preferences, documents] = await Promise.all([
    listSignatures(),
    getPreferences(),
    listDocuments(),
  ])

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
            <div className="w-32">
              <SignOutButton />
            </div>
            <Link
              href="/editor"
              className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--btn-accent)] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              Open editor
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <AccountView
        user={{ name: session.user.name ?? null, email: session.user.email }}
        initialSignatures={signatures}
        initialPreferences={preferences}
        documents={documents.map((d) => ({
          docId: d.docId,
          name: d.name,
          pageCount: d.pageCount,
          updatedAt: d.updatedAt,
        }))}
      />
    </main>
  )
}
