import type { Metadata } from 'next'
import { ToolLanding } from '@/components/landing/ToolLanding'
import { TOOL_PAGES } from '@/lib/seo/tool-pages'
import { authConfigured } from '@/lib/env'

const page = TOOL_PAGES.find((p) => p.slug === 'add-text-to-pdf')!

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  keywords: [...page.keywords],
  alternates: { canonical: `/${page.slug}` },
}

export default function AddTextToPdfPage() {
  return <ToolLanding page={page} authEnabled={authConfigured} />
}
