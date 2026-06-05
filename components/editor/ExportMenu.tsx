'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface ExportMenuProps {
  onDownload: () => void
}

export function ExportMenu({ onDownload }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={16} />
        Export
        <ChevronDown size={14} className="opacity-70" />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Export options"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow)]"
        >
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDownload()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--bg-panel)]"
          >
            <Download size={15} className="text-[var(--text-muted)]" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  )
}
