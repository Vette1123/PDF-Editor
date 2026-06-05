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
      className="flex h-full w-14 flex-col items-center gap-2 border-r border-[var(--border)] bg-[var(--bg-panel)] py-3"
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
                'grid h-10 w-10 place-items-center rounded-lg border transition-colors',
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

      <div className="my-1 h-px w-7 bg-[var(--border)]" />

      <Tooltip label="Delete (Del)" side="right">
        <button
          onClick={onDelete}
          disabled={!hasSelection}
          aria-label="Delete selection"
          className={[
            'grid h-10 w-10 place-items-center rounded-lg border border-transparent transition-colors',
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
