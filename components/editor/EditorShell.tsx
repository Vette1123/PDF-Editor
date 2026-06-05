'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
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
import { RecentDocuments } from './RecentDocuments'
import type { Tool, Annotation } from '@/lib/editor/types'
import { useMediaQuery } from '@/lib/use-media-query'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Logo } from '@/components/ui/Logo'
import { AccountMenu } from '@/components/auth/AccountMenu'
import { SessionWatcher } from '@/components/auth/SessionWatcher'
import { usePreferences } from '@/lib/editor/use-preferences'
import { upsertDocument, type SavedDocument } from '@/lib/documents/actions'
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
  const { theme, setTheme } = useTheme()

  // Sign-in status (drives DB sync + recent documents). Fed by <SessionWatcher>,
  // which is rendered only when auth is enabled so its request never fires
  // on auth-disabled deployments.
  const [signedIn, setSignedIn] = useState(false)
  const { defaultFont, defaultZoomRef, rememberFont, rememberZoom } = usePreferences({
    signedIn,
    theme,
    setTheme,
  })

  const [file, setFile] = useState<File | null>(null)
  const arrayBufferRef = useRef<ArrayBuffer | null>(null)
  // Id of the current document in the local IndexedDB store (lib/editor/pdf-store).
  const docIdRef = useRef<string | null>(null)
  // A recent draft whose PDF bytes aren't on this device — awaiting re-selection.
  const pendingReopenRef = useRef<{ docId: string; annotations: Annotation[] } | null>(null)
  const reopenInputRef = useRef<HTMLInputElement | null>(null)
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

  // Load a document into the editor: builds a File for react-pdf, resets the
  // view, and restores any annotation draft. Shared by upload, mount-restore,
  // and reopen-from-recent so the load path is identical in every case.
  const applyDocument = useCallback(
    (opts: { docId: string; name: string; bytes: ArrayBuffer; annotations?: Annotation[] }) => {
      docIdRef.current = opts.docId
      arrayBufferRef.current = opts.bytes
      pageWidthRef.current = null
      userZoomedRef.current = false
      setNumPages(0)
      setFilename(opts.name)
      setFile(new File([opts.bytes], `${opts.name}.pdf`, { type: 'application/pdf' }))
      dispatch({
        type: 'RESET',
        state: opts.annotations && opts.annotations.length > 0
          ? { annotations: opts.annotations }
          : undefined,
      })
    },
    [dispatch],
  )

  // ---- File upload (and reopen via re-selection) ----
  const handleFile = useCallback(
    async (f: File, opts?: { docId?: string; annotations?: Annotation[] }) => {
      const buf = await f.arrayBuffer()
      const name = f.name.replace(/\.pdf$/i, '') || 'document'
      const docId = opts?.docId ?? newDocId()
      applyDocument({ docId, name, bytes: buf, annotations: opts?.annotations })
      // Persist locally so the document survives a sign-in/sign-out navigation
      // (and full reloads). Bytes stay in the browser — never uploaded.
      void putDoc({
        docId,
        name,
        bytes: buf.slice(0),
        pageCount: 0,
        annotations: opts?.annotations ?? [],
        updatedAt: Date.now(),
      })
      void setCurrent(docId)
    },
    [applyDocument],
  )

  // Reopen a recent draft. If its PDF bytes are still on this device, open
  // immediately; otherwise prompt for re-selection and apply the saved draft.
  const handleOpenRecent = useCallback(
    async (doc: SavedDocument) => {
      const annotations = doc.annotations as Annotation[]
      const local = await getDoc(doc.docId)
      if (local?.bytes && local.bytes.byteLength > 0) {
        applyDocument({ docId: doc.docId, name: doc.name, bytes: local.bytes, annotations })
        void setCurrent(doc.docId)
        return
      }
      pendingReopenRef.current = { docId: doc.docId, annotations }
      toast({ kind: 'info', message: `Choose “${doc.name}” to reopen it with your saved edits.` })
      reopenInputRef.current?.click()
    },
    [applyDocument, toast],
  )

  const handleReopenInput = useCallback(
    (f: File | undefined | null) => {
      const pending = pendingReopenRef.current
      pendingReopenRef.current = null
      if (!f) return
      if (f.type !== 'application/pdf') {
        toast({ kind: 'error', message: 'Please choose a PDF file.' })
        return
      }
      void handleFile(f, pending ? { docId: pending.docId, annotations: pending.annotations } : undefined)
    },
    [handleFile, toast],
  )

  // ---- Restore the last document on mount (after a sign-in/out round trip or
  // a reload). Bytes are rebuilt into a File for react-pdf. Guarded by
  // `docIdRef` rather than a run-once flag so it stays correct under React
  // StrictMode's double-invoke (the second mount still restores), while never
  // clobbering a document the user has already opened in the meantime. ----
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const doc = await getCurrentDoc()
      if (cancelled || !doc || docIdRef.current) return
      applyDocument({
        docId: doc.docId,
        name: doc.name,
        bytes: doc.bytes,
        annotations: Array.isArray(doc.annotations) ? (doc.annotations as Annotation[]) : undefined,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [applyDocument])

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

  // Debounced sync of the annotation draft to the account ("recent documents").
  // Only the annotations + name are sent — never the PDF bytes.
  useEffect(() => {
    if (!signedIn) return
    const id = docIdRef.current
    if (!id) return
    const t = setTimeout(
      () =>
        void upsertDocument({
          docId: id,
          name: filename,
          annotations: state.annotations as unknown[],
          pageCount: numPages,
        }),
      1500,
    )
    return () => clearTimeout(t)
  }, [signedIn, state.annotations, filename, numPages])

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
  // resize backs off until the next document loads. Persists as the saved zoom.
  const handleZoom = useCallback(
    (next: number) => {
      userZoomedRef.current = true
      setScale(next)
      rememberZoom(next)
    },
    [rememberZoom],
  )

  // First page width arrives (or changes). Use the user's saved zoom if they
  // have one; otherwise auto fit-to-width.
  const handlePageWidth = useCallback(
    (width: number) => {
      pageWidthRef.current = width
      const saved = defaultZoomRef.current
      if (saved && !userZoomedRef.current) {
        setScale(Math.min(3, Math.max(0.25, saved)))
      } else {
        fitToWidth()
      }
    },
    [fitToWidth, defaultZoomRef],
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
      <div className="flex h-full flex-col bg-[var(--bg-canvas)]">
        {authEnabled && <SessionWatcher onChange={setSignedIn} />}
        {/* Header so signed-in users can reach their account / theme from here. */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-4">
          <Link
            href="/"
            aria-label="Signet home"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {authEnabled && <AccountMenu />}
          </div>
        </header>
        {/* Hidden input used to re-select a recent file whose bytes aren't local. */}
        <input
          ref={reopenInputRef}
          type="file"
          accept="application/pdf"
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => {
            handleReopenInput(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 py-12">
          <UploadDropzone onFile={(f) => void handleFile(f)} />
          {signedIn && <RecentDocuments onOpen={(d) => void handleOpenRecent(d)} />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg-canvas)]">
      {authEnabled && <SessionWatcher onChange={setSignedIn} />}
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
            defaultFont={defaultFont ?? undefined}
          />
        </main>

        <Inspector
          selected={selected}
          onUpdate={(id, patch) => {
            // Treat a font change as the new default for future text.
            if (patch.fontFamily) rememberFont(patch.fontFamily)
            dispatch({ type: 'UPDATE', id, patch })
          }}
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
