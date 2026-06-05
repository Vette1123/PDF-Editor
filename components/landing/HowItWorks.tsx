import { Upload, SquarePen, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Workflow
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-4xl">
            Three steps, start to finish
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
          {/* Connecting rail */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent sm:block"
          />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--accent)] shadow-[var(--shadow)]">
                  <Icon size={22} strokeWidth={1.75} />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white tabular-nums">
                    {i + 1}
                  </span>
                </span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-[var(--text)]">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
