import Link from 'next/link'
import { ArrowRight, ShieldCheck, Github } from 'lucide-react'
import { site } from '@/lib/seo/site'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Blueprint grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Accent halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
      />

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28 lg:pt-36">
        <a
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-panel)] py-1.5 pl-2 pr-3.5 text-xs text-[var(--text-muted)] shadow-[var(--shadow)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 font-medium text-[var(--accent)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </span>
            Open source
          </span>
          <span className="flex items-center gap-1">
            Star it on GitHub
            <Github size={13} className="opacity-70" />
          </span>
        </a>

        <h1 className="mx-auto mt-7 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--text)] sm:text-6xl lg:text-7xl">
          Edit &amp; sign PDFs,{' '}
          <span className="relative whitespace-nowrap">
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
              free and private
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
          Add text, draw or type signatures, and export — entirely in your browser.
          No uploads. No accounts. Your files never touch a server.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/editor"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-7 text-[15px] font-medium text-white shadow-[var(--shadow)] transition-[background-color,transform] hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] active:scale-[0.98] sm:w-auto"
          >
            Open the editor
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-panel)] px-7 text-[15px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] sm:w-auto"
          >
            See how it works
          </a>
        </div>

        <p className="mt-7 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <ShieldCheck size={15} className="text-[var(--success)]" />
          No upload
          <span className="text-[var(--border-strong)]">·</span>
          No account
          <span className="text-[var(--border-strong)]">·</span>
          100% in your browser
        </p>
      </div>
    </section>
  )
}
