'use client'

import { MousePointer2, Type, PenTool, Trash2 } from 'lucide-react'
import type { Tool } from '@/lib/editor/types'
import { Tooltip } from '@/components/ui/Tooltip'

export interface ToolbarProps {
  tool: Tool
  onTool: (tool: Tool) => void
  hasSelection: boolean
  onDelete: () => void
}

const TOOLS: { value: Tool; label: string; key: string; icon: typeof Type }[] = [
  { value: 'select', label: 'Select', key: 'V', icon: MousePointer2 },
  { value: 'text', label: 'Text', key: 'T', icon: Type },
  { value: 'signature', label: 'Signature', key: 'S', icon: PenTool },
]

export function Toolbar({ tool, onTool, hasSelection, onDelete }: ToolbarProps) {
  return (
    <nav
      aria-label="Tools"
      className={[
        // Mobile (< lg): fixed horizontal bar pinned to the bottom of the editor,
        // full width, safe-area aware, sitting above the canvas content.
        'fixed inset-x-0 bottom-0 z-30 flex items-center justify-evenly gap-2',
        'border-t border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        // Clip the side="right" tooltips on mobile (they don't show on touch and
        // would otherwise extend past the viewport edge → horizontal overflow).
        // Desktop rail keeps them visible.
        'overflow-x-clip lg:overflow-visible',
        // Desktop (lg+): restore the original static vertical left rail.
        'lg:static lg:inset-auto lg:z-auto lg:h-full lg:w-14 lg:flex-col lg:justify-start lg:gap-2',
        'lg:border-r lg:border-t-0 lg:px-0 lg:py-3 lg:pb-3',
      ].join(' ')}
    >
      {TOOLS.map((t) => {
        const Icon = t.icon
        const active = tool === t.value
        return (
          <Tooltip key={t.value} label={`${t.label} (${t.key})`} side="right">
            <button
              onClick={() => onTool(t.value)}
              aria-pressed={active}
              aria-label={`${t.label} tool`}
              className={[
                'grid h-11 w-11 place-items-center rounded-lg border transition-colors lg:h-10 lg:w-10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)]/[0.12] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              <Icon size={18} />
            </button>
          </Tooltip>
        )
      })}

      {/* Divider: horizontal separator on mobile, the original vertical-rule slab on desktop. */}
      <div className="h-7 w-px bg-[var(--border)] lg:my-1 lg:h-px lg:w-7" />

      <Tooltip label="Delete (Del)" side="right">
        <button
          onClick={onDelete}
          disabled={!hasSelection}
          aria-label="Delete selection"
          className={[
            'grid h-11 w-11 place-items-center rounded-lg border border-transparent transition-colors lg:h-10 lg:w-10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]',
            'disabled:opacity-30 disabled:pointer-events-none',
            'text-[var(--danger)] hover:bg-[var(--danger)]/10',
          ].join(' ')}
        >
          <Trash2 size={18} />
        </button>
      </Tooltip>
    </nav>
  )
}
