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
import type { Tool, Annotation } from '@/lib/editor/types'
import { useMediaQuery } from '@/lib/use-media-query'
import {
  getCurrentDoc,
  getDoc,
  putDoc,
  setCurrent,
  updateAnnotations,
  newDocId,
} from '@/lib/editor/pdf-store'

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
  // Id of the current document in the local IndexedDB store (lib/editor/pdf-store).
  const docIdRef = useRef<string | null>(null)
  const [filename, setFilename] = useState('document')
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [sigOpen, setSigOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [thumbsCollapsed, setThumbsCollapsed] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Fit-to-width plumbing: the canvas <main> gives us the available width; the
  // first PDF page reports its intrinsic (scale-1) width. fit = container / page.
  const mainRef = useRef<HTMLElement | null>(null)
  const pageWidthRef = useRef<number | null>(null)
  // Once the user manually zooms we stop auto-fitting on resize so we don't
  // fight them; the next document load resets this.
  const userZoomedRef = useRef(false)

  // Horizontal padding inside the canvas (px-6 => 24px each side).
  const CANVAS_PADDING = 48

  const fitToWidth = useCallback(() => {
    const el = mainRef.current
    const pageWidth = pageWidthRef.current
    if (!el || !pageWidth) return
    const avail = el.clientWidth - CANVAS_PADDING
    if (avail <= 0) return
    // Clamp to the same bounds the zoom controls use; cap at 1 so we never blow
    // a small page up past 100% just because the screen is wide.
    const next = Math.min(1, Math.max(0.25, avail / pageWidth))
    setScale(next)
  }, [])

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
      const name = f.name.replace(/\.pdf$/i, '') || 'document'
      setFile(f)
      setFilename(name)
      setNumPages(0)
      // New document: forget the previous page width and re-enable auto-fit so
      // the first page of the new doc fits the viewport.
      pageWidthRef.current = null
      userZoomedRef.current = false
      dispatch({ type: 'RESET' })

      // Persist locally so the document survives a sign-in/sign-out navigation
      // (and full reloads). Bytes stay in the browser — never uploaded.
      const docId = newDocId()
      docIdRef.current = docId
      void putDoc({
        docId,
        name,
        bytes: buf.slice(0),
        pageCount: 0,
        annotations: [],
        updatedAt: Date.now(),
      })
      void setCurrent(docId)
    },
    [dispatch],
  )

  // ---- Restore the last document on mount (after a sign-in/out round trip or
  // a reload). Runs once; bytes are rebuilt into a File for react-pdf. ----
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    let cancelled = false
    void (async () => {
      const doc = await getCurrentDoc()
      if (cancelled || !doc) return
      docIdRef.current = doc.docId
      arrayBufferRef.current = doc.bytes
      pageWidthRef.current = null
      userZoomedRef.current = false
      const restored = new File([doc.bytes], `${doc.name}.pdf`, { type: 'application/pdf' })
      setFilename(doc.name)
      setFile(restored)
      if (Array.isArray(doc.annotations) && doc.annotations.length > 0) {
        dispatch({ type: 'RESET', state: { annotations: doc.annotations as Annotation[] } })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dispatch])

  // Debounced local autosave of the annotation draft for the current document.
  useEffect(() => {
    const id = docIdRef.current
    if (!id) return
    const t = setTimeout(() => void updateAnnotations(id, state.annotations), 800)
    return () => clearTimeout(t)
  }, [state.annotations])

  // Record the page count once the document reports it (best effort).
  useEffect(() => {
    const id = docIdRef.current
    if (!id || !numPages) return
    void (async () => {
      const d = await getDoc(id)
      if (d && d.pageCount !== numPages) await putDoc({ ...d, pageCount: numPages })
    })()
  }, [numPages])

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
      {
        id: 'zoom-in',
        label: 'Zoom in',
        run: () => {
          userZoomedRef.current = true
          setScale((s) => Math.min(3, s + 0.1))
        },
      },
      {
        id: 'zoom-out',
        label: 'Zoom out',
        run: () => {
          userZoomedRef.current = true
          setScale((s) => Math.max(0.25, s - 0.1))
        },
      },
      { id: 'fit', label: 'Fit width', run: () => fitToWidth() },
    ],
    [setTool, dispatch, handleExport, fitToWidth],
  )

  // Manual zoom wrapper: marks that the user has taken control so auto-fit on
  // resize backs off until the next document loads.
  const handleZoom = useCallback((next: number) => {
    userZoomedRef.current = true
    setScale(next)
  }, [])

  // First page width arrives (or changes) -> auto fit-to-width once per document.
  const handlePageWidth = useCallback(
    (width: number) => {
      pageWidthRef.current = width
      fitToWidth()
    },
    [fitToWidth],
  )

  // Keep the page fit to the viewport on resize/orientation change — until the
  // user manually zooms.
  useEffect(() => {
    const onResize = () => {
      if (!userZoomedRef.current) fitToWidth()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitToWidth])

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
        onZoom={handleZoom}
        onFit={fitToWidth}
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
        <main
          ref={mainRef}
          className="min-w-0 flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0"
        >
          <DocumentCanvas
            file={file}
            scale={scale}
            tool={state.tool}
            annotations={state.annotations}
            selectedId={state.selectedId}
            currentPage={state.currentPage}
            dispatch={dispatch}
            onNumPages={setNumPages}
            onPageWidth={handlePageWidth}
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
