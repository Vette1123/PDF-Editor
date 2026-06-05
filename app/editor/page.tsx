import type { Metadata } from 'next'
import { EditorClient } from '@/components/editor/EditorClient'
import { site } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Editor',
  description: site.description,
  alternates: { canonical: '/editor' },
}

export default function EditorPage() {
  // `authEnabled` is wired to server-side auth config in Phase 6 (Task 6.x).
  // Until then it defaults to false so the editor renders without any auth.
  return (
    <main className="h-screen bg-[var(--bg-canvas)]">
      <EditorClient authEnabled={false} />
    </main>
  )
}
