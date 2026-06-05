import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg-canvas)] p-6 text-center">
      <div>
        <Logo className="text-xl justify-center" />
        <h1 className="mt-6 text-2xl font-semibold text-[var(--text)]">Page not found</h1>
        <Link href="/" className="mt-6 inline-block h-10 px-4 leading-10 rounded-lg bg-[var(--btn-accent)] text-white hover:bg-[var(--btn-accent-hover)]">
          Back home
        </Link>
      </div>
    </main>
  )
}
