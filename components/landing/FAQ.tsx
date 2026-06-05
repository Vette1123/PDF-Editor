'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FAQ_ITEMS } from './faq-data'

export function FAQ() {
  // First item open by default.
  const [open, setOpen] = useState(0)
  const reduce = useReducedMotion()

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
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            const panelId = `faq-panel-${i}`
            const buttonId = `faq-button-${i}`
            return (
              <div key={item.q} className="px-5 sm:px-6">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
                  >
                    {item.q}
                    <span
                      className={[
                        'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[var(--text-muted)] transition-[transform,color,border-color] duration-200',
                        isOpen
                          ? 'rotate-45 border-[var(--accent)] text-[var(--accent)]'
                          : 'border-[var(--border-strong)]',
                      ].join(' ')}
                    >
                      <Plus size={15} />
                    </span>
                  </button>
                </h3>
                {/* Content stays in the DOM (crawlable) — height animates. */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-10 text-sm leading-relaxed text-[var(--text-muted)]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
