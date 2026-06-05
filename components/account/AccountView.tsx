'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Palette,
  Type as TypeIcon,
  Search,
  Star,
  Pencil,
  Check,
  Trash2,
  FileText,
  PenLine,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useTheme } from '@/components/ui/ThemeProvider'
import { UI_FONTS } from '@/lib/editor/fonts'
import type { FontFamily } from '@/lib/editor/types'
import {
  renameSignature,
  setDefaultSignature,
  deleteSignature,
  type SavedSignature,
} from '@/lib/signatures/actions'
import { savePreferences, type Preferences } from '@/lib/preferences/actions'
import { deleteDocument } from '@/lib/documents/actions'
import { getDoc, setCurrent } from '@/lib/editor/pdf-store'

export interface AccountDocument {
  docId: string
  name: string
  pageCount: number
  updatedAt: string
}

export interface AccountViewProps {
  user: { name: string | null; email: string }
  initialSignatures: SavedSignature[]
  initialPreferences: Preferences
  documents: AccountDocument[]
}

const ZOOM_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Fit width', value: null },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
  { label: '125%', value: 125 },
  { label: '150%', value: 150 },
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--accent-text)]">
          <Icon size={17} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export function AccountView({
  user,
  initialSignatures,
  initialPreferences,
  documents: initialDocuments,
}: AccountViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const [signatures, setSignatures] = useState(initialSignatures)
  const [docs, setDocs] = useState(initialDocuments)
  const [font, setFont] = useState<FontFamily | null>(
    (initialPreferences.defaultFont as FontFamily | null) ?? null,
  )
  const [zoom, setZoom] = useState<number | null>(initialPreferences.defaultZoom ?? null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const initial = (user.name?.trim()?.[0] ?? user.email[0] ?? '?').toUpperCase()

  // ---- Preferences ----
  const persist = useCallback(
    async (patch: Partial<Preferences>) => {
      const res = await savePreferences(patch)
      if ('error' in res) toast({ kind: 'error', message: res.error })
      else toast({ kind: 'success', message: 'Preferences saved.' })
    },
    [toast],
  )

  const onThemeChange = useCallback(
    (next: 'light' | 'dark') => {
      setTheme(next)
      void persist({ theme: next })
    },
    [setTheme, persist],
  )

  const onFontChange = useCallback(
    (next: FontFamily) => {
      setFont(next)
      void persist({ defaultFont: next })
    },
    [persist],
  )

  const onZoomChange = useCallback(
    (next: number | null) => {
      setZoom(next)
      void persist({ defaultZoom: next })
    },
    [persist],
  )

  // ---- Signatures ----
  const handleSetDefault = useCallback(
    async (id: string) => {
      setSignatures((xs) =>
        [...xs.map((s) => ({ ...s, isDefault: s.id === id }))].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault),
        ),
      )
      const res = await setDefaultSignature(id)
      if ('error' in res) toast({ kind: 'error', message: res.error })
    },
    [toast],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setSignatures((xs) => xs.filter((s) => s.id !== id))
      const res = await deleteSignature(id)
      if ('error' in res) toast({ kind: 'error', message: res.error })
    },
    [toast],
  )

  const commitRename = useCallback(async () => {
    const id = editingId
    const name = editName.trim()
    setEditingId(null)
    if (!id || !name) return
    setSignatures((xs) => xs.map((s) => (s.id === id ? { ...s, name } : s)))
    const res = await renameSignature(id, name)
    if ('error' in res) toast({ kind: 'error', message: res.error })
  }, [editingId, editName, toast])

  // ---- Documents ----
  const handleOpenDoc = useCallback(
    async (docId: string) => {
      const local = await getDoc(docId)
      if (local?.bytes && local.bytes.byteLength > 0) {
        await setCurrent(docId)
      }
      router.push('/editor')
    },
    [router],
  )

  const handleDeleteDoc = useCallback(
    async (docId: string) => {
      setDocs((xs) => xs.filter((d) => d.docId !== docId))
      const res = await deleteDocument(docId)
      if ('error' in res) toast({ kind: 'error', message: res.error })
    },
    [toast],
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--btn-accent)] text-xl font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          {user.name && (
            <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--text)]">
              {user.name}
            </h1>
          )}
          <p className="truncate text-sm text-[var(--text-muted)]">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Preferences */}
        <Section
          icon={Palette}
          title="Preferences"
          description="These follow your account across devices."
        >
          <div className="flex flex-col gap-5">
            {/* Theme */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-[var(--text)]">Theme</span>
              <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border-strong)]">
                <button
                  type="button"
                  onClick={() => onThemeChange('light')}
                  aria-pressed={theme === 'light'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-[var(--btn-accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Sun size={15} /> Light
                </button>
                <button
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  aria-pressed={theme === 'dark'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-[var(--btn-accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Moon size={15} /> Dark
                </button>
              </div>
            </div>

            {/* Default font */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-[var(--text)]">
                <TypeIcon size={15} className="text-[var(--text-muted)]" />
                Default text font
              </span>
              <div className="flex flex-wrap gap-1.5">
                {UI_FONTS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onFontChange(f.value)}
                    aria-pressed={font === f.value}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      font === f.value
                        ? 'border-[var(--accent)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                    style={{ fontFamily: f.css }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default zoom */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-[var(--text)]">
                <Search size={15} className="text-[var(--text-muted)]" />
                Default zoom
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ZOOM_OPTIONS.map((z) => (
                  <button
                    key={z.label}
                    type="button"
                    onClick={() => onZoomChange(z.value)}
                    aria-pressed={zoom === z.value}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      zoom === z.value
                        ? 'border-[var(--accent)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Saved signatures */}
        <Section
          icon={PenLine}
          title="Saved signatures"
          description="Reuse these in the editor. Star one to make it your default."
        >
          {signatures.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-canvas)] px-6 py-10 text-center">
              <PenLine size={24} className="text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text)]">No saved signatures yet</p>
              <p className="text-xs text-[var(--text-muted)]">
                Open the editor, add a signature, then “Save to my account”.
              </p>
              <Link href="/editor" className="mt-1">
                <Button variant="primary" size="sm">Go to editor</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {signatures.map((s) => (
                <div
                  key={s.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]"
                >
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(s.id)}
                    aria-label={s.isDefault ? `${s.name} is your default` : `Set ${s.name} as default`}
                    aria-pressed={s.isDefault}
                    title={s.isDefault ? 'Default signature' : 'Set as default'}
                    className={`absolute left-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-lg bg-[var(--bg-panel)]/90 transition-[opacity,color] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                      s.isDefault
                        ? 'text-[var(--accent)] opacity-100'
                        : 'text-[var(--text-muted)] opacity-0 hover:text-[var(--text)] group-hover:opacity-100'
                    }`}
                  >
                    <Star size={15} fill={s.isDefault ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(s.id)}
                    aria-label={`Delete signature ${s.name}`}
                    className="absolute right-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-lg bg-[var(--bg-panel)]/90 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--danger)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="grid h-24 w-full place-items-center bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.dataUrl} alt={s.name} className="max-h-16 object-contain" />
                  </div>
                  <div className="flex items-center gap-1 border-t border-[var(--border)] px-2 py-1.5">
                    {editingId === s.id ? (
                      <>
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => void commitRename()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void commitRename()
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              setEditingId(null)
                            }
                          }}
                          aria-label="Rename signature"
                          className="min-w-0 flex-1 rounded border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-1.5 py-0.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          type="button"
                          onClick={() => void commitRename()}
                          aria-label="Save name"
                          className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--accent)] hover:bg-[var(--bg-elevated)]"
                        >
                          <Check size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-muted)]">
                          {s.name}
                          {s.isDefault && <span className="text-[var(--accent-text)]"> · default</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(s.id)
                            setEditName(s.name)
                          }}
                          aria-label={`Rename ${s.name}`}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Pencil size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Recent documents */}
        <Section
          icon={FileText}
          title="Recent documents"
          description="Drafts sync to your account. The PDF files themselves stay on your device."
        >
          {docs.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-canvas)] px-6 py-10 text-center">
              <FileText size={24} className="text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text)]">No recent documents</p>
              <p className="text-xs text-[var(--text-muted)]">
                Edits you make in the editor are saved here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {docs.map((d) => (
                <li key={d.docId} className="group flex items-center gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => void handleOpenDoc(d.docId)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] group-hover:text-[var(--accent)]">
                      <FileText size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--text)]">{d.name}</span>
                      <span className="block text-xs text-[var(--text-muted)]">
                        {d.pageCount > 0 ? `${d.pageCount} page${d.pageCount === 1 ? '' : 's'} · ` : ''}
                        {relativeTime(d.updatedAt)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteDoc(d.docId)}
                    aria-label={`Remove ${d.name}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--danger)] focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
