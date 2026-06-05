import type { Metadata } from 'next'
import Link from 'next/link'
import { authConfigured } from '@/lib/env'
import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'
import { AccountsDisabledNotice } from '@/components/auth/AccountsDisabledNotice'

export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  if (!authConfigured) return <AccountsDisabledNotice />

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to save and reuse your signatures."
      footer={
        <>
          New to Signet?{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
