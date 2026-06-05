'use client'

import {
  Type,
  PenTool,
  Move,
  ZoomIn,
  Download,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { motion, type Variants } from 'motion/react'

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Type,
    title: 'Add text anywhere',
    body: 'Drop editable text on any page with control over font, size, and color. Standard PDF fonts embed cleanly on export.',
  },
  {
    icon: PenTool,
    title: 'Real signatures',
    body: 'Draw with your mouse or finger, type in a handwriting font, or upload an image. Place it exactly where it belongs.',
  },
  {
    icon: Move,
    title: 'Drag to position',
    body: 'Move and resize every element with pixel precision — works with both pointer and touch, with keyboard nudging too.',
  },
  {
    icon: ZoomIn,
    title: 'Zoom & multi-page',
    body: 'Navigate long documents with page thumbnails and smooth zoom, so you always edit at the right level of detail.',
  },
  {
    icon: Download,
    title: 'Pixel-accurate export',
    body: 'Download a flattened PDF where text and signatures land exactly where you placed them — no surprises.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Everything runs locally in your browser. Files are never uploaded, stored, or shared. Privacy is the default.',
  },
]

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Capabilities
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-4xl">
            Everything you need to finish the document
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            A focused toolset that does the common PDF jobs well — and keeps your data on your machine.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3"
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={card}
              className="group relative bg-[var(--bg-panel)] p-7 transition-colors hover:bg-[var(--bg-elevated)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <motion.span
                className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]"
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Icon size={20} strokeWidth={1.75} />
              </motion.span>
              <h3 className="mt-5 text-[17px] font-medium text-[var(--text)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
