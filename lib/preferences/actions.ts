'use server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userPreference } from '@/lib/db/schema'
import { getSession } from '@/lib/get-session'

export interface Preferences {
  theme: string | null
  defaultFont: string | null
  /** Default zoom as an integer percent (e.g. 100). */
  defaultZoom: number | null
}

const EMPTY: Preferences = { theme: null, defaultFont: null, defaultZoom: null }

export async function getPreferences(): Promise<Preferences> {
  const session = await getSession()
  if (!session || !db) return EMPTY
  const row = await db.select().from(userPreference)
    .where(eq(userPreference.userId, session.user.id))
    .limit(1)
  const p = row[0]
  if (!p) return EMPTY
  return { theme: p.theme, defaultFont: p.defaultFont, defaultZoom: p.defaultZoom }
}

export async function savePreferences(
  patch: Partial<Preferences>,
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession()
  if (!session || !db) return { error: 'Not signed in' }
  const set = {
    ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
    ...(patch.defaultFont !== undefined ? { defaultFont: patch.defaultFont } : {}),
    ...(patch.defaultZoom !== undefined ? { defaultZoom: patch.defaultZoom } : {}),
  }
  await db.insert(userPreference).values({ userId: session.user.id, ...set })
    .onConflictDoUpdate({
      target: userPreference.userId,
      set: { ...set, updatedAt: new Date() },
    })
  return { ok: true }
}
