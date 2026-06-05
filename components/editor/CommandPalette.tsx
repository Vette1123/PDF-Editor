'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, CornerDownLeft } from 'lucide-react'

export interface Command {
  id: string
  label: string
  hint?: string
  run: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  // Reset query/active when the palette transitions to open (adjust during
  // render, React-recommended) so we never setState synchronously in an effect.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setQuery('')
      setActive(0)
    }
  }

  // Clamp the active index to the filtered list during render.
  const clampedActive = Math.min(active, Math.max(0, filtered.length - 1))
  if (clampedActive !== active) setActive(clampedActive)

  // Focus management + scroll lock (side effects only).
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus())
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
        prevFocus.current?.focus()
      }
    }
  }, [open])

  // keep active option in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[active]
      if (cmd) {
        onClose()
        cmd.run()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[18vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow)]"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            aria-label="Search commands"
            aria-controls="command-list"
            className="w-full bg-transparent py-3.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <ul
          id="command-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-72 overflow-auto p-2"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
              No commands found
            </li>
          )}
          {filtered.map((c, i) => {
            const isActive = i === active
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={isActive}
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onClose()
                  c.run()
                }}
                className={[
                  'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm',
                  isActive
                    ? 'bg-[var(--accent)]/[0.12] text-[var(--text)]'
                    : 'text-[var(--text-muted)]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  {isActive && <CornerDownLeft size={14} className="text-[var(--accent)]" />}
                  {c.label}
                </span>
                {c.hint && (
                  <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                    {c.hint}
                  </kbd>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
