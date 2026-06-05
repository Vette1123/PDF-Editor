import { Plus } from 'lucide-react'
import { FAQ_ITEMS } from './faq-data'

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Questions
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-4xl">
            Frequently asked
          </h2>
        </div>

        <div className="mt-12 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)]">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-45 group-open:border-[var(--accent)] group-open:text-[var(--accent)]">
                  <Plus size={15} />
                </span>
              </summary>
              <p className="pb-5 pr-10 text-sm leading-relaxed text-[var(--text-muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
