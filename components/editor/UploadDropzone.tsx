'use client'

import { useCallback, useRef, useState } from 'react'
import { FileUp, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export interface UploadDropzoneProps {
  onFile: (file: File) => void
  maxBytes?: number
}

export function UploadDropzone({
  onFile,
  maxBytes = DEFAULT_MAX_BYTES,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const { toast } = useToast()

  const validateAndEmit = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (file.type !== 'application/pdf') {
        toast({ kind: 'error', message: 'Please choose a PDF file.' })
        return
      }
      if (file.size > maxBytes) {
        const mb = Math.round(maxBytes / (1024 * 1024))
        toast({ kind: 'error', message: `File is too large. Max size is ${mb}MB.` })
        return
      }
      onFile(file)
    },
    [maxBytes, onFile, toast],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndEmit(e.target.files?.[0])
      // Reset so re-selecting the same file fires change again.
      e.target.value = ''
    },
    [validateAndEmit],
  )

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      validateAndEmit(e.dataTransfer.files?.[0])
    },
    [validateAndEmit],
  )

  return (
    <div className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-xl">
        <div
          role="button"
          tabIndex={0}
          aria-label="Choose a PDF — drop a file here or activate to browse"
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={handleDrop}
          className={[
            'group relative flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden',
            'rounded-2xl border border-dashed px-10 py-16 text-center transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]',
            dragging
              ? 'border-[var(--accent)] bg-[var(--accent)]/[0.06]'
              : 'border-[var(--border-strong)] bg-[var(--bg-panel)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]',
          ].join(' ')}
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        >
          <span
            className={[
              'grid h-16 w-16 place-items-center rounded-2xl border transition-colors',
              dragging
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] group-hover:text-[var(--accent)]',
            ].join(' ')}
          >
            <FileUp size={26} />
          </span>

          <div className="space-y-1.5">
            <p className="text-lg font-semibold tracking-tight text-[var(--text)]">
              {dragging ? 'Drop to open' : 'Drop a PDF, or click to browse'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Up to {Math.round(maxBytes / (1024 * 1024))}MB · processed locally
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            aria-label="Upload PDF"
            className="sr-only"
            onChange={handleInputChange}
          />
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <ShieldCheck size={14} className="text-[var(--success)]" />
          Files never leave your device.
        </p>
      </div>
    </div>
  )
}
