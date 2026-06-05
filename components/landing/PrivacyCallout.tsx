'use client'

import Link from 'next/link'
import { Lock, WifiOff, FileLock2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

const POINTS = [
  { icon: WifiOff, label: 'No uploads', detail: 'Files are read locally — never sent over the network.' },
  { icon: FileLock2, label: 'No storage', detail: 'Nothing is saved on a server. Close the tab and it is gone.' },
  { icon: Lock, label: 'No tracking your docs', detail: 'Your document content is never seen by us or anyone else.' },
]

export function PrivacyCallout() {
  const reduce = useReducedMotion()
  const spin = (deg: number, dur: number) =>
    reduce ? undefined : { rotate: deg, transition: { duration: dur, repeat: Infinity, ease: 'linear' as const } }

  return (
    <section className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-panel)] px-6 py-14 text-center sm:px-12">
          {/* Animated engraved seal motif — orbiting dashed rings + pulsing core. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
          >
            <circle cx="100" cy="100" r="92" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <motion.circle
              cx="100" cy="100" r="80" fill="none" stroke="var(--accent)" strokeWidth="1"
              strokeDasharray="2 12" strokeLinecap="round"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={spin(360, 70)}
            />
            <motion.circle
              cx="100" cy="100" r="64" fill="none" stroke="var(--accent)" strokeWidth="1.5"
              strokeDasharray="6 10" strokeLinecap="round"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={spin(-360, 45)}
            />
            <motion.circle
              cx="100" cy="100" r="30" fill="var(--accent)"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={reduce ? undefined : { scale: [1, 1.1, 1], opacity: [1, 0.65, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, var(--accent) 0%, transparent 70%)' }}
          />

          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-1 text-xs font-medium text-[var(--text)]">
            <Lock size={13} className="text-[var(--success)]" />
            Privacy-first
          </span>

          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-[-0.02em] text-[var(--text)] sm:text-4xl">
            Your files never leave your device
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[var(--text-muted)]">
            Signet does all of its work inside your browser using your own computer&apos;s power.
            There is no server to upload to, so there is nothing to leak.
          </p>

          <dl className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            {POINTS.map(({ icon: Icon, label, detail }, i) => (
              <motion.div
                key={label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-5"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              >
                <dt className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                  <Icon size={16} className="text-[var(--accent)]" />
                  {label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{detail}</dd>
              </motion.div>
            ))}
          </dl>

          <Link
            href="/editor"
            className="mt-10 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--btn-accent)] px-6 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[var(--btn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-panel)] active:scale-[0.98]"
          >
            Try it now — no sign-up
          </Link>
        </div>
      </div>
    </section>
  )
}
