'use client'

import '@/lib/pdf/worker'
import { useCallback, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { Loader2, FileWarning } from 'lucide-react'
import type { Action, Annotation, Tool } from '@/lib/editor/types'
import { UI_FONTS } from '@/lib/editor/fonts'
import { AnnotationLayer } from './AnnotationLayer'

export interface DocumentCanvasProps {
  file: File
  scale: number
  tool: Tool
  annotations: Annotation[]
  selectedId: string | null
  currentPage: number
  dispatch: (action: Action | { type: 'UNDO' } | { type: 'REDO' }) => void
  onNumPages: (n: number) => void
}

const fontCss = (family: string) =>
  UI_FONTS.find((f) => f.value === family)?.css ?? 'Helvetica, Arial, sans-serif'

export function DocumentCanvas({
  file,
  scale,
  tool,
  annotations,
  selectedId,
  dispatch,
  onNumPages,
}: DocumentCanvasProps) {
  const [numPages, setNumPages] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [hover, setHover] = useState<{ page: number; x: number; y: number } | null>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  const onLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setLoadError(false)
      setNumPages(n)
      pageRefs.current = new Array(n).fill(null)
      onNumPages(n)
    },
    [onNumPages],
  )

  // Stop editing if the edited annotation disappears or selection clears.
  // Adjust during render (React-recommended) rather than in an effect.
  if (editingId && !annotations.some((a) => a.id === editingId)) {
    setEditingId(null)
  }

  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (tool !== 'text') return
    if (e.target !== e.currentTarget) return // ignore clicks on existing annotations
    const el = pageRefs.current[pageNumber - 1]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    dispatch({ type: 'ADD_TEXT', x, y, page: pageNumber })
    setHover(null)
  }

  const handlePageMouseMove = (e: React.MouseEvent, pageNumber: number) => {
    if (tool !== 'text') {
      if (hover) setHover(null)
      return
    }
    const el = pageRefs.current[pageNumber - 1]
    if (!el) return
    const rect = el.getBoundingClientRect()
    setHover({ page: pageNumber, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  if (loadError) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div className="space-y-3">
          <FileWarning size={36} className="mx-auto text-[var(--danger)]" />
          <p className="font-medium text-[var(--text)]">Could not open this PDF</p>
          <p className="text-sm text-[var(--text-muted)]">
            The file may be corrupted or password-protected.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full overflow-auto"
      style={{
        background: 'var(--bg-canvas)',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="flex flex-col items-center gap-8 px-6 py-10">
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className="flex items-center gap-2 py-20 text-[var(--text-muted)]">
              <Loader2 size={18} className="animate-spin" />
              Loading document…
            </div>
          }
          error={
            <div className="py-20 text-[var(--danger)]">Failed to load PDF.</div>
          }
        >
          {Array.from({ length: numPages }, (_, index) => {
            const pageNumber = index + 1
            const pageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber)
            const editing =
              editingId &&
              pageAnnotations.find((a) => a.id === editingId && a.kind === 'text')
            return (
              <div key={`page_${pageNumber}`} className="relative">
                <div
                  ref={(el) => {
                    pageRefs.current[index] = el
                  }}
                  className="relative bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-[var(--border)]"
                  onClick={(e) => handlePageClick(e, pageNumber)}
                  onMouseMove={(e) => handlePageMouseMove(e, pageNumber)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: tool === 'text' ? 'crosshair' : 'default' }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />

                  {/* Caret preview when text tool active */}
                  {hover && hover.page === pageNumber && tool === 'text' && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute"
                      style={{
                        left: hover.x,
                        top: hover.y,
                        width: 2,
                        height: 22,
                        background: 'var(--accent)',
                        animation: 'blink 1s infinite',
                      }}
                    />
                  )}

                  <AnnotationLayer
                    annotations={pageAnnotations.filter((a) => a.id !== editingId)}
                    scale={scale}
                    tool={tool}
                    selectedId={selectedId}
                    onSelect={(id) => dispatch({ type: 'SELECT', id })}
                    onUpdate={(id, patch) => dispatch({ type: 'UPDATE', id, patch })}
                    onStartEditText={(id) => setEditingId(id)}
                  />

                  {/* Inline text editor */}
                  {editing && editing.kind === 'text' && (
                    <input
                      autoFocus
                      type="text"
                      value={editing.text}
                      onChange={(e) =>
                        dispatch({ type: 'UPDATE', id: editing.id, patch: { text: e.target.value } })
                      }
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          e.preventDefault()
                          setEditingId(null)
                        }
                        e.stopPropagation()
                      }}
                      className="absolute border-2 border-[var(--accent)] bg-white outline-none"
                      style={{
                        left: editing.x * scale,
                        top: editing.y * scale,
                        fontSize: editing.fontSize * scale,
                        color: editing.color,
                        fontFamily: fontCss(editing.fontFamily),
                        fontWeight: editing.fontFamily === 'Helvetica-Bold' ? 700 : 400,
                        padding: `${2 * scale}px ${4 * scale}px`,
                        lineHeight: 1.1,
                        minWidth: 80,
                      }}
                    />
                  )}
                </div>

                <div className="pointer-events-none absolute -bottom-6 left-0 right-0 text-center">
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {pageNumber} / {numPages}
                  </span>
                </div>
              </div>
            )
          })}
        </Document>
      </div>
    </div>
  )
}
