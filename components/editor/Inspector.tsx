'use client'

import type {
  Annotation,
  TextAnnotation,
  SignatureAnnotation,
  FontFamily,
} from '@/lib/editor/types'
import { UI_FONTS } from '@/lib/editor/fonts'

export interface InspectorProps {
  selected: Annotation | null
  onUpdate: (id: string, patch: Partial<TextAnnotation> & Partial<SignatureAnnotation>) => void
}

const SWATCHES = ['#000000', '#ffffff', '#f43f5e', '#6366f1', '#10b981', '#f59e0b']
const FONT_SIZES = [10, 12, 14, 16, 18, 24, 32, 48, 64]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]'

export function Inspector({ selected, onUpdate }: InspectorProps) {
  return (
    <aside
      aria-label="Properties"
      className="flex h-full w-72 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--bg-panel)]"
    >
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">
          {selected ? (selected.kind === 'text' ? 'Text' : 'Signature') : 'Properties'}
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {!selected && (
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Select an annotation to edit its properties, or pick a tool to add text and signatures.
          </p>
        )}

        {selected?.kind === 'text' && (
          <div className="space-y-5">
            <Field label="Content">
              <textarea
                value={selected.text}
                onChange={(e) => onUpdate(selected.id, { text: e.target.value })}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Font">
              <select
                value={selected.fontFamily}
                onChange={(e) =>
                  onUpdate(selected.id, { fontFamily: e.target.value as FontFamily })
                }
                className={inputClass}
              >
                {UI_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Size">
              <select
                value={selected.fontSize}
                onChange={(e) => onUpdate(selected.id, { fontSize: Number(e.target.value) })}
                className={inputClass}
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Color">
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Set color ${c}`}
                      aria-pressed={selected.color.toLowerCase() === c}
                      onClick={() => onUpdate(selected.id, { color: c })}
                      className={[
                        'h-6 w-6 rounded-full border transition-transform hover:scale-110',
                        selected.color.toLowerCase() === c
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent-ring)]'
                          : 'border-[var(--border-strong)]',
                      ].join(' ')}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  aria-label="Custom color"
                  value={selected.color}
                  onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
                  className="h-7 w-7 cursor-pointer rounded border border-[var(--border)] bg-transparent"
                />
              </div>
            </Field>
          </div>
        )}

        {selected?.kind === 'signature' && (
          <div className="space-y-5">
            <Field label={`Width — ${Math.round(selected.width)}px`}>
              <input
                type="range"
                min={40}
                max={600}
                value={selected.width}
                onChange={(e) => {
                  const ratio = selected.height / selected.width
                  const width = Number(e.target.value)
                  onUpdate(selected.id, { width, height: Math.round(width * ratio) })
                }}
                className="w-full accent-[var(--accent)]"
              />
            </Field>

            <div className="grid w-full place-items-center rounded-lg border border-[var(--border)] bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.imageData}
                alt="Signature preview"
                className="max-h-24 object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
