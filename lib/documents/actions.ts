'use server'
import { randomUUID } from 'crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { document } from '@/lib/db/schema'
import { getSession } from '@/lib/get-session'

export interface SavedDocument {
  docId: string
  name: string
  /** Parsed annotations array (deserialized from stored JSON). */
  annotations: unknown[]
  pageCount: number
  updatedAt: string
}

export async function listDocuments(): Promise<SavedDocument[]> {
  const session = await getSession()
  if (!session || !db) return []
  const rows = await db.select().from(document)
    .where(eq(document.userId, session.user.id))
    .orderBy(desc(document.updatedAt))
  return rows.map((r) => ({
    docId: r.docId,
    name: r.name,
    annotations: safeParse(r.annotations),
    pageCount: r.pageCount,
    updatedAt: r.updatedAt.toISOString(),
  }))
}

export async function upsertDocument(input: {
  docId: string
  name: string
  annotations: unknown[]
  pageCount: number
}): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  const annotations = JSON.stringify(input.annotations ?? [])
  await db.insert(document).values({
    id: randomUUID(),
    userId: session.user.id,
    docId: input.docId,
    name: input.name?.trim() || 'document',
    annotations,
    pageCount: input.pageCount ?? 0,
  }).onConflictDoUpdate({
    target: [document.userId, document.docId],
    set: { name: input.name?.trim() || 'document', annotations, pageCount: input.pageCount ?? 0, updatedAt: new Date() },
  })
  return { ok: true }
}

export async function deleteDocument(docId: string): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  await db.delete(document)
    .where(and(eq(document.docId, docId), eq(document.userId, session.user.id)))
  return { ok: true }
}

/** Tolerant JSON parse — a corrupt/empty column degrades to an empty draft. */
function safeParse(raw: string): unknown[] {
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
