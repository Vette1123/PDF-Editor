import type { Metadata } from 'next'
import Link from 'next/link'
import { authConfigured } from '@/lib/env'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { AccountsDisabledNotice } from '@/components/auth/AccountsDisabledNotice'

export const metadata: Metadata = {
  title: 'Sign up',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  if (!authConfigured) return <AccountsDisabledNotice />

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save signatures once and reuse them anytime."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
