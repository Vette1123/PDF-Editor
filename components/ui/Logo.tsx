export function Logo({
  className = '',
  /**
   * When true (default), the "signet" wordmark hides below `sm` and only the
   * mark is shown. Set to false to always show the wordmark.
   */
  responsiveWordmark = true,
}: {
  className?: string
  responsiveWordmark?: boolean
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3.5" fill="var(--accent)" />
      </svg>
      <span className={`text-[var(--text)] ${responsiveWordmark ? 'hidden sm:inline' : ''}`}>
        signet
      </span>
    </span>
  )
}
