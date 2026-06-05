'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditor } from '@/lib/editor/use-editor'
import { exportPdf, downloadBytes } from '@/lib/editor/export'
import { useToast } from '@/components/ui/Toast'
import { UploadDropzone } from './UploadDropzone'
import { Toolbar } from './Toolbar'
import { TopBar } from './TopBar'
import { DocumentCanvas } from './DocumentCanvas'
import { Inspector } from './Inspector'
import { PageThumbnails } from './PageThumbnails'
import { SignatureModal } from './SignatureModal'
import { CommandPalette, type Command } from './CommandPalette'
import type { Tool } from '@/lib/editor/types'
import { useMediaQuery } from '@/lib/use-media-query'

const isTypingTarget = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null
  if (!node) return false
  const tag = node.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable
}

export default function EditorShell({ authEnabled = false }: { authEnabled?: boolean }) {
  const { state, dispatch, canUndo, canRedo } = useEditor()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const arrayBufferRef = useRef<ArrayBuffer | null>(null)
  const [filename, setFilename] = useState('document')
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [sigOpen, setSigOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [thumbsCollapsed, setThumbsCollapsed] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Below lg the thumbnails default to collapsed so they never steal canvas
  // width; on desktop they stay expanded. Follows the breakpoint until the user
  // overrides it manually for the current width.
  const lastDesktop = useRef<boolean | null>(null)
  useEffect(() => {
    if (lastDesktop.current === isDesktop) return
    lastDesktop.current = isDesktop
    setThumbsCollapsed(!isDesktop)
  }, [isDesktop])

  const selected = useMemo(
    () => state.annotations.find((a) => a.id === state.selectedId) ?? null,
    [state.annotations, state.selectedId],
  )

  // ---- File upload ----
  const handleFile = useCallback(
    async (f: File) => {
      const buf = await f.arrayBuffer()
      arrayBufferRef.current = buf
      setFile(f)
      setFilename(f.name.replace(/\.pdf$/i, '') || 'document')
      setNumPages(0)
      dispatch({ type: 'RESET' })
    },
    [dispatch],
  )

  // ---- Export ----
  const handleExport = useCallback(async () => {
    if (!arrayBufferRef.current) {
      toast({ kind: 'error', message: 'Open a PDF first.' })
      return
    }
    try {
      // Clone the buffer: pdf-lib consumes it, but we keep the source for re-export.
      const copy = arrayBufferRef.current.slice(0)
      const bytes = await exportPdf(copy, state.annotations)
      downloadBytes(bytes, `${filename || 'document'}.pdf`)
      toast({ kind: 'success', message: 'PDF exported.' })
    } catch (err) {
      console.error(err)
      toast({ kind: 'error', message: 'Export failed. Please try again.' })
    }
  }, [state.annotations, filename, toast])

  // ---- Signature ----
  const handleSignatureSave = useCallback(
    (dataUrl: string) => {
      dispatch({ type: 'ADD_SIGNATURE', imageData: dataUrl, page: state.currentPage })
      dispatch({ type: 'SET_TOOL', tool: 'select' })
    },
    [dispatch, state.currentPage],
  )

  const setTool = useCallback(
    (tool: Tool) => {
      dispatch({ type: 'SET_TOOL', tool })
      if (tool === 'signature') setSigOpen(true)
    },
    [dispatch],
  )

  const deleteSelection = useCallback(() => {
    if (state.selectedId) dispatch({ type: 'DELETE', id: state.selectedId })
  }, [dispatch, state.selectedId])

  // ---- Global keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Command palette toggles even while typing.
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }

      if (mod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        dispatch(e.shiftKey ? { type: 'REDO' } : { type: 'UNDO' })
        return
      }

      if (isTypingTarget(e.target)) return

      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT', id: null })
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId) {
          e.preventDefault()
          dispatch({ type: 'DELETE', id: state.selectedId })
        }
        return
      }
      if (e.key === 'v' || e.key === 'V') setTool('select')
      else if (e.key === 't' || e.key === 'T') setTool('text')
      else if (e.key === 's' || e.key === 'S') setTool('signature')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, setTool, state.selectedId])

  // ---- Command palette commands ----
  const commands: Command[] = useMemo(
    () => [
      { id: 'select', label: 'Select tool', hint: 'V', run: () => setTool('select') },
      { id: 'text', label: 'Add text', hint: 'T', run: () => setTool('text') },
      { id: 'signature', label: 'Add signature', hint: 'S', run: () => setTool('signature') },
      { id: 'undo', label: 'Undo', hint: '⌘Z', run: () => dispatch({ type: 'UNDO' }) },
      { id: 'redo', label: 'Redo', hint: '⌘⇧Z', run: () => dispatch({ type: 'REDO' }) },
      { id: 'export', label: 'Export PDF', run: () => void handleExport() },
      { id: 'zoom-in', label: 'Zoom in', run: () => setScale((s) => Math.min(3, s + 0.1)) },
      { id: 'zoom-out', label: 'Zoom out', run: () => setScale((s) => Math.max(0.25, s - 0.1)) },
      { id: 'fit', label: 'Fit width', run: () => setScale(1) },
    ],
    [setTool, dispatch, handleExport],
  )

  const onFit = useCallback(() => setScale(1), [])

  // ---- Empty state ----
  if (!file) {
    return (
      <div className="grid h-full place-items-center bg-[var(--bg-canvas)]">
        <UploadDropzone onFile={handleFile} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg-canvas)]">
      <TopBar
        filename={filename}
        onRename={setFilename}
        page={state.currentPage}
        numPages={numPages}
        onPage={(p) => dispatch({ type: 'SET_PAGE', page: p })}
        scale={scale}
        onZoom={setScale}
        onFit={onFit}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        onExport={() => void handleExport()}
        authEnabled={authEnabled}
      />

      <div className="relative flex min-h-0 flex-1">
        <Toolbar
          tool={state.tool}
          onTool={setTool}
          hasSelection={!!state.selectedId}
          onDelete={deleteSelection}
        />

        <PageThumbnails
          file={file}
          numPages={numPages}
          current={state.currentPage}
          onJump={(p) => dispatch({ type: 'SET_PAGE', page: p })}
          collapsed={thumbsCollapsed}
          onToggle={() => setThumbsCollapsed((c) => !c)}
        />

        {/* Bottom padding on mobile clears the fixed bottom toolbar so canvas
            content (and its last page) is never hidden behind it. */}
        <main className="min-w-0 flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0">
          <DocumentCanvas
            file={file}
            scale={scale}
            tool={state.tool}
            annotations={state.annotations}
            selectedId={state.selectedId}
            currentPage={state.currentPage}
            dispatch={dispatch}
            onNumPages={setNumPages}
          />
        </main>

        <Inspector
          selected={selected}
          onUpdate={(id, patch) => dispatch({ type: 'UPDATE', id, patch })}
          onClose={() => dispatch({ type: 'SELECT', id: null })}
        />
      </div>

      <SignatureModal
        open={sigOpen}
        onClose={() => setSigOpen(false)}
        onSave={handleSignatureSave}
        authEnabled={authEnabled}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
  )
}
