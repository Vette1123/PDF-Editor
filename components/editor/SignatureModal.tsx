'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Pencil, Type, Upload, Eraser, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onSave: (dataUrl: string) => void
  /** Reserved for Phase 6 (saved signatures). Currently ignored. */
  authEnabled?: boolean
}

type Mode = 'draw' | 'type' | 'upload'

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

const TABS: { id: Mode; label: string; icon: typeof Pencil }[] = [
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'type', label: 'Type', icon: Type },
  { id: 'upload', label: 'Upload', icon: Upload },
]

export function SignatureModal({ open, onClose, onSave }: SignatureModalProps) {
  const [mode, setMode] = useState<Mode>('draw')
  const [text, setText] = useState('')
  const [fontIndex, setFontIndex] = useState(0)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const typeCanvasRef = useRef<HTMLCanvasElement>(null)
  const [prevOpen, setPrevOpen] = useState(open)
  const { toast } = useToast()

  const font = HANDWRITING_FONTS[fontIndex]

  // Reset transient state when the modal transitions to closed (adjust during
  // render, React-recommended) instead of calling setState inside an effect.
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) {
      setText('')
      setUploadPreview(null)
    }
  }

  // Clear the drawing canvas (imperative DOM side effect) on close.
  useEffect(() => {
    if (!open) sigCanvasRef.current?.clear()
  }, [open])

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
    else setUploadPreview(null)
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

  const handleSave = useCallback(() => {
    if (mode === 'draw') {
      const sig = sigCanvasRef.current
      if (!sig || sig.isEmpty()) {
        toast({ kind: 'error', message: 'Please draw your signature first.' })
        return
      }
      onSave(sig.toDataURL('image/png'))
      onClose()
      return
    }
    if (mode === 'type') {
      if (!text.trim()) {
        toast({ kind: 'error', message: 'Please type your name first.' })
        return
      }
      const canvas = typeCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `64px '${font.cssName}'`
      ctx.fillStyle = '#000'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 12, canvas.height / 2)
      onSave(canvas.toDataURL('image/png'))
      onClose()
      return
    }
    // upload
    if (!uploadPreview) {
      toast({ kind: 'error', message: 'Please choose an image first.' })
      return
    }
    onSave(uploadPreview)
    onClose()
  }, [mode, text, font, uploadPreview, onSave, onClose, toast])

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
          {TABS.map((t) => {
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
        </div>

        {/* Footer */}
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
      </div>
    </Dialog>
  )
}
