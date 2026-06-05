import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { faqLd } from '@/lib/seo/structured-data'
import { site } from '@/lib/seo/site'
import { TOOL_PAGES, type ToolPage } from '@/lib/seo/tool-pages'

/**
 * Shared layout for the long-tail SEO landing pages (/sign-pdf, …). Each page
 * targets a single search intent and funnels into /editor. Server-rendered,
 * static markup — content lives in `lib/seo/tool-pages.ts`.
 */

function howToLd(page: ToolPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.h1,
    description: page.metaDescription,
    step: page.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  }
}

export function ToolLanding({ page, authEnabled }: { page: ToolPage; authEnabled: boolean }) {
  const others = TOOL_PAGES.filter((p) => p.slug !== page.slug)

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd(page)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(page.faq)) }} />
      <Nav authEnabled={authEnabled} />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-24 sm:px-8 sm:pt-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-text)]">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {page.intro}
            </p>
            <div className="mt-8">
              <Link
                href="/editor"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--btn-accent)] px-7 text-[15px] font-medium text-white shadow-[var(--shadow)] transition-[background-color,transform] hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] active:scale-[0.98] sm:w-auto"
              >
                Open the editor — it&apos;s free
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                No sign-up. No upload. Your file never leaves your device.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {page.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--accent-text)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--text)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-3xl">
            Frequently asked
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {page.faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--text)]">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links to sibling tool pages */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
              More free PDF tools
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-sm text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                  >
                    {p.h1}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/"
                  className="text-sm text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                >
                  About {site.name}
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
