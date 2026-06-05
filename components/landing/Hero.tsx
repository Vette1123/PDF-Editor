'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { GithubIcon } from '@/components/ui/GithubIcon'
import { site } from '@/lib/seo/site'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

// Fixed positions (no Math.random — keeps SSR/CSR markup identical) for the
// small drifting particles in the hero backdrop.
const PARTICLES = [
  { left: '12%', top: '30%', size: 6, travel: 26, dur: 7, delay: 0 },
  { left: '24%', top: '62%', size: 4, travel: 18, dur: 9, delay: 1.2 },
  { left: '46%', top: '22%', size: 5, travel: 30, dur: 8, delay: 0.6 },
  { left: '68%', top: '58%', size: 4, travel: 22, dur: 10, delay: 2 },
  { left: '82%', top: '34%', size: 6, travel: 28, dur: 7.5, delay: 0.4 },
  { left: '90%', top: '66%', size: 3, travel: 16, dur: 11, delay: 1.6 },
]

export function Hero() {
  const reduce = useReducedMotion()
  // Reduced motion: skip the looping aurora; keep a static halo.
  const float = (extra: Record<string, number[]>) =>
    reduce ? undefined : { ...extra }

  return (
    <section className="relative isolate overflow-hidden">
      {/* Blueprint grid backdrop — slowly drifts one cell over time. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        animate={reduce ? undefined : { backgroundPosition: ['0px 0px', '64px 64px'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />

      {/* Small drifting particles. */}
      {!reduce &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 rounded-full bg-[var(--accent)]"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            initial={{ opacity: 0.2 }}
            animate={{ y: [0, -p.travel, 0], opacity: [0.12, 0.45, 0.12] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      {/* Living aurora — two slow-drifting accent blooms. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
        initial={{ opacity: 0.3 }}
        animate={float({ opacity: [0.22, 0.4, 0.22], scale: [1, 1.12, 1], x: [-20, 24, -20] })}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[2rem] -z-10 h-[22rem] w-[22rem] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, var(--accent-hover) 0%, transparent 70%)' }}
        initial={{ opacity: 0.18 }}
        animate={float({ opacity: [0.12, 0.26, 0.12], y: [0, 28, 0] })}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <motion.div
        className="mx-auto max-w-6xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28 lg:pt-36"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.a
          variants={item}
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-panel)] py-1.5 pl-2 pr-3.5 text-xs text-[var(--text-muted)] shadow-[var(--shadow)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 font-medium text-[var(--accent-text)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </span>
            Open source
          </span>
          <span className="flex items-center gap-1">
            Star it on GitHub
            <GithubIcon size={13} className="opacity-70" />
          </span>
        </motion.a>

        <motion.h1
          variants={item}
          className="mx-auto mt-7 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--text)] sm:text-6xl lg:text-7xl"
        >
          Edit &amp; sign PDFs,{' '}
          <span className="relative whitespace-nowrap">
            <span className="animate-gradient-x bg-[linear-gradient(110deg,var(--accent),var(--accent-hover),var(--accent))] bg-[length:200%_auto] bg-clip-text text-transparent">
              free and private
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg"
        >
          Add text, draw or type signatures, and export — entirely in your browser.
          No uploads. No accounts. Your files never touch a server.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/editor"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--btn-accent)] px-7 text-[15px] font-medium text-white shadow-[var(--shadow)] transition-[background-color,transform] hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] active:scale-[0.98] sm:w-auto"
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
        </motion.div>

        <motion.p
          variants={item}
          className="mt-7 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]"
        >
          <ShieldCheck size={15} className="text-[var(--success)]" />
          No upload
          <span className="text-[var(--border-strong)]">·</span>
          No account
          <span className="text-[var(--border-strong)]">·</span>
          100% in your browser
        </motion.p>
      </motion.div>
    </section>
  )
}
