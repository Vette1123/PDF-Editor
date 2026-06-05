import Link from 'next/link'
import { GithubIcon } from '@/components/ui/GithubIcon'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/lib/seo/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            aria-label="Signet home"
            className="w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <Logo />
          </Link>
          <p className="text-sm text-[var(--text-muted)]">
            {site.tagline}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {year} {site.name}. Free &amp; open source.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex items-center gap-2">
            <a
              href={site.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              <GithubIcon size={16} />
              GitHub
            </a>
            <Link
              href="/editor"
              className="inline-flex items-center rounded-lg bg-[var(--btn-accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              Open editor
            </Link>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Crafted by{' '}
            <a
              href={site.authorUrl}
              target="_blank"
              rel="author noopener noreferrer"
              className="font-medium text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              {site.author}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
