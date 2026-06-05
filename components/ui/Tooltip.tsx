'use client'
export function Tooltip({
  label, children, side = 'right',
}: { label: string; children: React.ReactNode; side?: 'right' | 'bottom' }) {
  const pos = side === 'right'
    ? 'left-full top-1/2 -translate-y-1/2 ml-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2'
  return (
    <span className="relative group inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos} z-50 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text)] shadow-[var(--shadow)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity`}
      >
        {label}
      </span>
    </span>
  )
}
