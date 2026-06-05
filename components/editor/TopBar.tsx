'use client'

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Tooltip } from '@/components/ui/Tooltip'
import { ExportMenu } from './ExportMenu'

// better-auth's useSession is browser-only; load AccountMenu client-side to keep
// it out of any server prerender path.
const AccountMenu = dynamic(
  () => import('@/components/auth/AccountMenu').then((m) => m.AccountMenu),
  { ssr: false },
)

export interface TopBarProps {
  filename: string
  onRename: (name: string) => void
  page: number
  numPages: number
  onPage: (page: number) => void
  scale: number
  onZoom: (scale: number) => void
  onFit: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  authEnabled?: boolean
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip label={label} side="bottom">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:pointer-events-none disabled:opacity-30"
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function TopBar({
  filename,
  onRename,
  page,
  numPages,
  onPage,
  scale,
  onZoom,
  onFit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  authEnabled = false,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-panel)] px-4">
      <Logo />

      <div className="mx-1 h-6 w-px bg-[var(--border)]" />

      {/* Filename */}
      <input
        value={filename}
        onChange={(e) => onRename(e.target.value)}
        aria-label="Document name"
        spellCheck={false}
        className="min-w-0 max-w-[14rem] flex-shrink truncate rounded-md bg-transparent px-2 py-1 text-sm font-medium text-[var(--text)] outline-none transition-colors hover:bg-[var(--bg-elevated)] focus:bg-[var(--bg-elevated)] focus:ring-2 focus:ring-[var(--accent-ring)]"
      />

      <div className="flex flex-1 items-center justify-center gap-1">
        {/* Page nav */}
        <div className="flex items-center gap-1">
          <IconButton label="Previous page" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>
            <ChevronLeft size={18} />
          </IconButton>
          <span className="min-w-[4.5rem] text-center font-mono text-xs text-[var(--text-muted)]">
            {page} / {numPages || 1}
          </span>
          <IconButton
            label="Next page"
            onClick={() => onPage(Math.min(numPages, page + 1))}
            disabled={page >= numPages}
          >
            <ChevronRight size={18} />
          </IconButton>
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--border)]" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <IconButton label="Zoom out" onClick={() => onZoom(Math.max(0.25, scale - 0.1))}>
            <ZoomOut size={18} />
          </IconButton>
          <span className="min-w-[3rem] text-center font-mono text-xs text-[var(--text-muted)]">
            {Math.round(scale * 100)}%
          </span>
          <IconButton label="Zoom in" onClick={() => onZoom(Math.min(3, scale + 0.1))}>
            <ZoomIn size={18} />
          </IconButton>
          <IconButton label="Fit width" onClick={onFit}>
            <Maximize2 size={16} />
          </IconButton>
        </div>
      </div>

      {/* Undo / redo */}
      <div className="flex items-center gap-1">
        <IconButton label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={18} />
        </IconButton>
        <IconButton label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 size={18} />
        </IconButton>
      </div>

      <div className="mx-1 h-6 w-px bg-[var(--border)]" />

      <ExportMenu onDownload={onExport} />
      <ThemeToggle />
      {authEnabled && <AccountMenu />}
    </header>
  )
}
