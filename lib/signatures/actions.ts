'use server'
import { randomUUID } from 'crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { signature } from '@/lib/db/schema'
import { getSession } from '@/lib/get-session'

export interface SavedSignature {
  id: string
  name: string
  dataUrl: string
  isDefault: boolean
  createdAt: string
}

export async function listSignatures(): Promise<SavedSignature[]> {
  const session = await getSession()
  if (!session || !db) return []
  const rows = await db.select().from(signature)
    .where(eq(signature.userId, session.user.id))
    // Default first, then newest.
    .orderBy(desc(signature.isDefault), desc(signature.createdAt))
  return rows.map((r) => ({
    id: r.id, name: r.name, dataUrl: r.dataUrl, isDefault: r.isDefault,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function saveSignature(
  input: { name: string; dataUrl: string },
): Promise<{ id: string } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  const id = randomUUID()
  await db.insert(signature).values({
    id, userId: session.user.id, name: input.name?.trim() || 'Signature', dataUrl: input.dataUrl,
  })
  return { id }
}

export async function renameSignature(
  id: string,
  name: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  const trimmed = name?.trim()
  if (!trimmed) return { error: 'Name cannot be empty' }
  await db.update(signature).set({ name: trimmed })
    .where(and(eq(signature.id, id), eq(signature.userId, session.user.id)))
  return { ok: true }
}

/**
 * Mark one signature as the user's default, clearing the flag on the others.
 * neon-http has no interactive transactions, so this is two sequential writes
 * scoped to the user — a brief window with zero defaults is harmless.
 */
export async function setDefaultSignature(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  await db.update(signature).set({ isDefault: false })
    .where(eq(signature.userId, session.user.id))
  await db.update(signature).set({ isDefault: true })
    .where(and(eq(signature.id, id), eq(signature.userId, session.user.id)))
  return { ok: true }
}

export async function deleteSignature(id: string): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  await db.delete(signature).where(and(eq(signature.id, id), eq(signature.userId, session.user.id)))
  return { ok: true }
}
