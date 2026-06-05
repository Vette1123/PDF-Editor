'use client'
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg-canvas)] p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Something went wrong</h1>
        <p className="mt-2 text-[var(--text-muted)]">An unexpected error occurred. Your files were never uploaded.</p>
        <button onClick={reset}
          className="mt-6 h-10 px-4 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          Try again
        </button>
      </div>
    </main>
  )
}
