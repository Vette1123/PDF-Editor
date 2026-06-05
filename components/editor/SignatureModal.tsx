'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import SignatureCanvas from 'react-signature-canvas'
import { Pencil, Type, Upload, Eraser, X, Save, Bookmark, Trash2 } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useSession } from '@/lib/auth-client'
import {
  listSignatures,
  saveSignature,
  deleteSignature,
  type SavedSignature,
} from '@/lib/signatures/actions'

export interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onSave: (dataUrl: string) => void
  /** When true (auth configured), enables the "Saved" tab and account saving. */
  authEnabled?: boolean
}

type Mode = 'draw' | 'type' | 'upload' | 'saved'

interface HandwritingFont {
  label: string
  /** font-family name exposed by next/font (Phase 5). */
  cssName: string
  /** CSS var holding the family, with a cursive fallback for tests/dev. */
  cssVar: string
}

const HANDWRITING_FONTS: HandwritingFont[] = [
  { label: 'Caveat', cssName: 'Caveat', cssVar: 'var(--font-caveat, cursive)' },
  { label: 'Dancing Script', cssName: 'Dancing Script', cssVar: 'var(--font-dancing, cursive)' },
  { label: 'Great Vibes', cssName: 'Great Vibes', cssVar: 'var(--font-great-vibes, cursive)' },
  { label: 'Sacramento', cssName: 'Sacramento', cssVar: 'var(--font-sacramento, cursive)' },
]

const INPUT_TABS: { id: Mode; label: string; icon: typeof Pencil }[] = [
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'type', label: 'Type', icon: Type },
  { id: 'upload', label: 'Upload', icon: Upload },
]

export function SignatureModal({ open, onClose, onSave, authEnabled = false }: SignatureModalProps) {
  const [mode, setMode] = useState<Mode>('draw')
  const [text, setText] = useState('')
  const [fontIndex, setFontIndex] = useState(0)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const typeCanvasRef = useRef<HTMLCanvasElement>(null)
  const [prevOpen, setPrevOpen] = useState(open)
  const { toast } = useToast()

  // The session hook is always called (rules of hooks); we only act on its
  // result when `authEnabled` so auth-disabled deployments never use it.
  const { data: sessionData } = useSession()
  const signedIn = authEnabled && Boolean(sessionData)

  // Account-saving state.
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  const font = HANDWRITING_FONTS[fontIndex]

  // Reset transient state when the modal transitions to closed (adjust during
  // render, React-recommended) instead of calling setState inside an effect.
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) {
      setText('')
      setUploadPreview(null)
      setSaveName('')
      setMode('draw')
    }
  }

  // Clear the drawing canvas (imperative DOM side effect) on close.
  useEffect(() => {
    if (!open) sigCanvasRef.current?.clear()
  }, [open])

  // Load saved signatures when the Saved tab opens (and the user is signed in).
  const refreshSaved = useCallback(async () => {
    setLoadingSaved(true)
    try {
      setSaved(await listSignatures())
    } finally {
      setLoadingSaved(false)
    }
  }, [])

  useEffect(() => {
    if (open && mode === 'saved' && signedIn) void refreshSaved()
  }, [open, mode, signedIn, refreshSaved])

  // Live preview render for the Type tab.
  useEffect(() => {
    if (mode !== 'type') return
    let cancelled = false
    const render = async () => {
      try {
        await (document as Document).fonts.ready
      } catch {
        /* fonts API may be unavailable in some test envs */
      }
      if (cancelled) return
      const canvas = typeCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!text) return
      ctx.font = `64px '${font.cssName}'`
      ctx.fillStyle = '#000'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 12, canvas.height / 2)
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [text, font, mode])

  const handleClear = useCallback(() => {
    if (mode === 'draw') sigCanvasRef.current?.clear()
    else if (mode === 'type') setText('')
    else if (mode === 'upload') setUploadPreview(null)
  }, [mode])

  const handleUploadFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast({ kind: 'error', message: 'Please choose an image file.' })
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => setUploadPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    },
    [toast],
  )

  /**
   * Build the current signature as a PNG data URL from the active input tab,
   * or null if the tab has no content. Toasts an error on empty input.
   */
  const currentDataUrl = useCallback((): string | null => {
    if (mode === 'draw') {
      const sig = sigCanvasRef.current
      if (!sig || sig.isEmpty()) {
        toast({ kind: 'error', message: 'Please draw your signature first.' })
        return null
      }
      return sig.toDataURL('image/png')
    }
    if (mode === 'type') {
      if (!text.trim()) {
        toast({ kind: 'error', message: 'Please type your name first.' })
        return null
      }
      const canvas = typeCanvasRef.current
      if (!canvas) return null
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `64px '${font.cssName}'`
      ctx.fillStyle = '#000'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 12, canvas.height / 2)
      return canvas.toDataURL('image/png')
    }
    // upload
    if (!uploadPreview) {
      toast({ kind: 'error', message: 'Please choose an image first.' })
      return null
    }
    return uploadPreview
  }, [mode, text, font, uploadPreview, toast])

  const handleSave = useCallback(() => {
    const dataUrl = currentDataUrl()
    if (!dataUrl) return
    onSave(dataUrl)
    onClose()
  }, [currentDataUrl, onSave, onClose])

  const handleSaveToAccount = useCallback(async () => {
    const dataUrl = currentDataUrl()
    if (!dataUrl) return
    setSaving(true)
    try {
      const res = await saveSignature({ name: saveName, dataUrl })
      if ('error' in res) {
        toast({ kind: 'error', message: res.error })
        return
      }
      toast({ kind: 'success', message: 'Signature saved to your account.' })
      setSaveName('')
    } finally {
      setSaving(false)
    }
  }, [currentDataUrl, saveName, toast])

  const handleInsertSaved = useCallback(
    (dataUrl: string) => {
      onSave(dataUrl)
      onClose()
    },
    [onSave, onClose],
  )

  const handleDeleteSaved = useCallback(
    async (id: string) => {
      const res = await deleteSignature(id)
      if ('error' in res) {
        toast({ kind: 'error', message: res.error })
        return
      }
      setSaved((xs) => xs.filter((s) => s.id !== id))
    },
    [toast],
  )

  return (
    <Dialog open={open} onClose={onClose} label="Add signature">
      <div className="flex max-h-[90vh] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-[var(--text)]">
            Add signature
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
            className="!px-2"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Signature input mode" className="flex border-b border-[var(--border)]">
          {INPUT_TABS.map((t) => {
            const Icon = t.icon
            const active = mode === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                aria-controls={`sig-panel-${t.id}`}
                id={`sig-tab-${t.id}`}
                onClick={() => setMode(t.id)}
                className={[
                  'flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-b-2 border-[var(--accent)] text-[var(--text)]'
                    : 'border-b-2 border-transparent text-[var(--text-muted)] hover:text-[var(--text)]',
                ].join(' ')}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
          {authEnabled && (
            <button
              role="tab"
              aria-selected={mode === 'saved'}
              aria-controls="sig-panel-saved"
              id="sig-tab-saved"
              onClick={() => setMode('saved')}
              className={[
                'flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
                mode === 'saved'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--text)]'
                  : 'border-b-2 border-transparent text-[var(--text-muted)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              <Bookmark size={16} />
              Saved
            </button>
          )}
        </div>

        {/* Panels */}
        <div className="flex-1 overflow-auto p-6">
          {mode === 'draw' && (
            <div
              role="tabpanel"
              id="sig-panel-draw"
              aria-labelledby="sig-tab-draw"
              className="flex flex-col gap-3"
            >
              <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-white">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  backgroundColor="white"
                  penColor="#111"
                  canvasProps={{ className: 'w-full h-64 cursor-crosshair touch-none' }}
                />
              </div>
              <p className="text-center text-sm text-[var(--text-muted)]">
                Draw with your mouse, trackpad, or finger.
              </p>
            </div>
          )}

          {mode === 'type' && (
            <div
              role="tabpanel"
              id="sig-panel-type"
              aria-labelledby="sig-tab-type"
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="sig-name"
                  className="mb-1.5 block text-sm font-medium text-[var(--text)]"
                >
                  Your name
                </label>
                <input
                  id="sig-name"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Mohamed Gado"
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  Style
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {HANDWRITING_FONTS.map((f, i) => (
                    <button
                      key={f.cssName}
                      type="button"
                      onClick={() => setFontIndex(i)}
                      aria-pressed={fontIndex === i}
                      className={[
                        'rounded-lg border px-4 py-3 text-2xl leading-none transition-colors',
                        fontIndex === i
                          ? 'border-[var(--accent)] bg-[var(--accent)]/[0.08] text-[var(--text)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]',
                      ].join(' ')}
                      style={{ fontFamily: f.cssVar }}
                    >
                      {text || f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid min-h-[120px] place-items-center rounded-xl border border-[var(--border)] bg-white p-4">
                <canvas
                  ref={typeCanvasRef}
                  width={600}
                  height={100}
                  className="max-w-full"
                  aria-label="Signature preview"
                />
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div
              role="tabpanel"
              id="sig-panel-upload"
              aria-labelledby="sig-tab-upload"
              className="flex flex-col items-center gap-4"
            >
              <label
                htmlFor="sig-upload"
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-canvas)] px-6 py-10 text-center transition-colors hover:border-[var(--accent)]"
              >
                <Upload size={28} className="text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text)]">
                  Click to choose a signature image
                </span>
                <span className="text-xs text-[var(--text-muted)]">PNG or JPG</span>
                <input
                  id="sig-upload"
                  type="file"
                  accept="image/*"
                  aria-label="Upload signature image"
                  className="sr-only"
                  onChange={(e) => {
                    handleUploadFile(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
              {uploadPreview && (
                <div className="grid w-full place-items-center rounded-xl border border-[var(--border)] bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadPreview}
                    alt="Signature preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'saved' && authEnabled && (
            <div
              role="tabpanel"
              id="sig-panel-saved"
              aria-labelledby="sig-tab-saved"
              className="flex flex-col gap-3"
            >
              {!signedIn ? (
                <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-canvas)] px-6 py-12 text-center">
                  <Bookmark size={28} className="text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text)]">
                    Sign in to save and reuse signatures
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                  >
                    Sign in
                  </Link>
                </div>
              ) : loadingSaved ? (
                <p className="py-12 text-center text-sm text-[var(--text-muted)]">Loading…</p>
              ) : saved.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--text-muted)]">
                  No saved signatures yet. Draw, type, or upload one, then use
                  &ldquo;Save to my account&rdquo;.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {saved.map((s) => (
                    <div
                      key={s.id}
                      className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => handleInsertSaved(s.dataUrl)}
                        aria-label={`Insert signature ${s.name}`}
                        className="grid h-24 w-full place-items-center p-3 transition-colors hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.dataUrl} alt={s.name} className="max-h-16 object-contain" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSaved(s.id)}
                        aria-label={`Delete signature ${s.name}`}
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-[var(--bg-panel)]/90 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--danger)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save-to-account control (only when signed in, and not on the Saved tab) */}
        {signedIn && mode !== 'saved' && (
          <div className="flex items-center gap-2 border-t border-[var(--border)] px-6 py-3">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Name this signature (optional)"
              aria-label="Signature name"
              className="min-w-0 flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
            />
            <Button variant="ghost" size="sm" onClick={handleSaveToAccount} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save to my account'}
            </Button>
          </div>
        )}

        {/* Footer */}
        {mode !== 'saved' && (
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Eraser size={16} />
              Clear
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Add signature
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
