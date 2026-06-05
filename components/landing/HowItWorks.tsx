'use client'

import { Upload, SquarePen, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Upload,
    title: 'Upload',
    body: 'Drop a PDF or pick one from your device. It opens instantly — and stays entirely on your machine.',
  },
  {
    icon: SquarePen,
    title: 'Edit & sign',
    body: 'Add text, draw or type a signature, then drag and resize each element exactly where you want it.',
  },
  {
    icon: Download,
    title: 'Export',
    body: 'Download the finished PDF with everything flattened in place. No upload, no waiting, no watermark.',
  },
]

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}
const step: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Workflow
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-4xl">
            Three steps, start to finish
          </h2>
        </div>

        <motion.ol
          className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8"
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Connecting rail — draws left-to-right as the section enters. */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent sm:block"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.li key={title} variants={step} className="relative">
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <motion.span
                  className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--accent)] shadow-[var(--shadow)]"
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                >
                  <Icon size={22} strokeWidth={1.75} />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--btn-accent)] text-xs font-semibold text-white tabular-nums">
                    {i + 1}
                  </span>
                </motion.span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-[var(--text)]">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
                {body}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
