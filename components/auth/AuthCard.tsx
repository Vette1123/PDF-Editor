import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Rendered under the card (e.g. "Already have an account? Log in"). */
  footer?: React.ReactNode
}

/** Centered card shell for auth forms — logo, title, content, optional footer. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Link
          href="/"
          aria-label="Signet home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
          <Logo className="text-base" />
        </Link>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow)]">
        {children}
      </div>

      {footer && (
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">{footer}</p>
      )}
    </div>
  )
}
