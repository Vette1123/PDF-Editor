'use server'
import { randomUUID } from 'crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { signature } from '@/lib/db/schema'
import { getSession } from '@/lib/get-session'

export interface SavedSignature { id: string; name: string; dataUrl: string; createdAt: string }

export async function listSignatures(): Promise<SavedSignature[]> {
  const session = await getSession()
  if (!session || !db) return []
  const rows = await db.select().from(signature)
    .where(eq(signature.userId, session.user.id))
    .orderBy(desc(signature.createdAt))
  return rows.map((r) => ({
    id: r.id, name: r.name, dataUrl: r.dataUrl, createdAt: r.createdAt.toISOString(),
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

export async function deleteSignature(id: string): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  await db.delete(signature).where(and(eq(signature.id, id), eq(signature.userId, session.user.id)))
  return { ok: true }
}
