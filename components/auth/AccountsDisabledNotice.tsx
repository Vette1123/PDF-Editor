import Link from 'next/link'
import { AuthCard } from './AuthCard'

/** Shown on /login and /signup when auth isn't configured on this deployment. */
export function AccountsDisabledNotice() {
  return (
    <AuthCard
      title="Accounts aren't enabled"
      subtitle="This deployment runs without accounts. The editor still works fully — your PDFs never leave your browser."
    >
      <Link
        href="/editor"
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] active:scale-[0.98]"
      >
        Open the editor
      </Link>
    </AuthCard>
  )
}
