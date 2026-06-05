'use client'
import dynamic from 'next/dynamic'

const EditorShell = dynamic(() => import('./EditorShell'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center text-[var(--text-muted)]">
      Loading editor…
    </div>
  ),
})

export function EditorClient({ authEnabled = false }: { authEnabled?: boolean }) {
  return <EditorShell authEnabled={authEnabled} />
}
