'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileText, Clock, Trash2 } from 'lucide-react'
import { listDocuments, deleteDocument, type SavedDocument } from '@/lib/documents/actions'
import { useToast } from '@/components/ui/Toast'

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export interface RecentDocumentsProps {
  /** Reopen a saved draft — caller restores PDF bytes + applies annotations. */
  onOpen: (doc: SavedDocument) => void
}

/**
 * Lists the signed-in user's saved annotation drafts (the PDF bytes themselves
 * stay local — see lib/editor/pdf-store). Shown beneath the upload dropzone when
 * the editor has no document open. Renders nothing if there are no drafts.
 */
export function RecentDocuments({ onOpen }: RecentDocumentsProps) {
  const [docs, setDocs] = useState<SavedDocument[] | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const rows = await listDocuments()
      if (!cancelled) setDocs(rows)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = useCallback(
    async (docId: string) => {
      setDocs((xs) => (xs ? xs.filter((d) => d.docId !== docId) : xs))
      const res = await deleteDocument(docId)
      if ('error' in res) toast({ kind: 'error', message: res.error })
    },
    [toast],
  )

  if (!docs || docs.length === 0) return null

  return (
    <div className="mx-auto mt-10 w-full max-w-xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
        <Clock size={15} />
        Recent documents
      </h2>
      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]">
        {docs.map((d) => (
          <li key={d.docId} className="group flex items-center gap-3 px-3 py-2.5">
            <button
              type="button"
              onClick={() => onOpen(d)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] group-hover:text-[var(--accent)]">
                <FileText size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--text)]">
                  {d.name}
                </span>
                <span className="block text-xs text-[var(--text-muted)]">
                  {d.pageCount > 0 ? `${d.pageCount} page${d.pageCount === 1 ? '' : 's'} · ` : ''}
                  {relativeTime(d.updatedAt)}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => void handleDelete(d.docId)}
              aria-label={`Remove ${d.name} from recent documents`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--danger)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        Drafts sync to your account. Your PDF files stay on this device.
      </p>
    </div>
  )
}
