import type { Metadata } from 'next'
import { EditorClient } from '@/components/editor/EditorClient'
import { site } from '@/lib/seo/site'
import { authConfigured } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Editor',
  description: site.description,
  alternates: { canonical: '/editor' },
}

export default function EditorPage() {
  return (
    <main className="h-screen bg-[var(--bg-canvas)]">
      <EditorClient authEnabled={authConfigured} />
    </main>
  )
}
