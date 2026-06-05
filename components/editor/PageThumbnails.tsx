'use client'

import { Document, Page } from 'react-pdf'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'

export interface PageThumbnailsProps {
  file: File
  numPages: number
  current: number
  onJump: (page: number) => void
  collapsed: boolean
  onToggle: () => void
}

export function PageThumbnails({
  file,
  numPages,
  current,
  onJump,
  collapsed,
  onToggle,
}: PageThumbnailsProps) {
  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 justify-center border-r border-[var(--border)] bg-[var(--bg-panel)] py-3">
        <Tooltip label="Show pages" side="right">
          <button
            onClick={onToggle}
            aria-label="Show page thumbnails"
            className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
          >
            <PanelLeftOpen size={18} />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <aside
      aria-label="Pages"
      className={[
        'flex w-40 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-panel)]',
        // Below lg the expanded panel overlays the canvas instead of stealing
        // layout width, so the document keeps the full viewport on phones.
        'absolute inset-y-0 left-0 z-20 shadow-xl lg:static lg:z-auto lg:shadow-none',
      ].join(' ')}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Pages
        </span>
        <button
          onClick={onToggle}
          aria-label="Hide page thumbnails"
          className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Document file={file} loading={null} error={null}>
          <div className="flex flex-col gap-3">
            {Array.from({ length: numPages }, (_, i) => {
              const pageNumber = i + 1
              const active = pageNumber === current
              return (
                <button
                  key={pageNumber}
                  onClick={() => onJump(pageNumber)}
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={active ? 'true' : undefined}
                  className="group flex flex-col items-center gap-1 outline-none"
                >
                  <span
                    className={[
                      'overflow-hidden rounded-md border-2 bg-white transition-colors',
                      active
                        ? 'border-[var(--accent)]'
                        : 'border-[var(--border)] group-hover:border-[var(--border-strong)]',
                    ].join(' ')}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={120}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <span className="block h-40 w-[120px] bg-[var(--bg-elevated)]" />
                      }
                    />
                  </span>
                  <span
                    className={[
                      'font-mono text-[11px]',
                      active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    {pageNumber}
                  </span>
                </button>
              )
            })}
          </div>
        </Document>
      </div>
    </aside>
  )
}
