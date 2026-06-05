/**
 * Client-only IndexedDB store for uploaded PDFs and their annotation drafts.
 *
 * The PDF *bytes* live ONLY here, in the browser — never on a server — which is
 * what lets us restore the user's document across a sign-in/sign-out navigation
 * while keeping Signet's "files never leave your device" promise. Logged-in
 * annotation drafts are additionally synced to the DB (see lib/documents), but
 * the binary itself is always local.
 *
 * Every entry point is guarded so it degrades to a no-op (or empty result) when
 * IndexedDB is unavailable — SSR, private-mode browsers, or test environments.
 */

export interface StoredDoc {
  docId: string
  name: string
  bytes: ArrayBuffer
  pageCount: number
  /** EditorState annotations array; opaque to the store, JSON-serializable. */
  annotations: unknown
  updatedAt: number
}

/** Listing shape — omits the heavy `bytes` blob. */
export type StoredDocMeta = Omit<StoredDoc, 'bytes'> & { hasBytes: boolean }

const DB_NAME = 'signet'
const DB_VERSION = 1
const DOCS = 'documents'
const META = 'meta'
const CURRENT_KEY = 'currentDocId'

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

/** Generate a stable document id. Falls back when crypto.randomUUID is absent. */
export function newDocId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `doc-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(DOCS)) db.createObjectStore(DOCS, { keyPath: 'docId' })
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function promisify(req: IDBRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  // `IDBRequest` (unparameterised) accepts get/getAll/put/delete uniformly —
  // their result types are invariant and won't unify under a single generic.
  fn: (s: IDBObjectStore) => IDBRequest | Promise<unknown>,
): Promise<T | undefined> {
  if (!hasIndexedDB()) return undefined
  const db = await openDb()
  try {
    const tx = db.transaction(store, mode)
    const res = fn(tx.objectStore(store))
    const value = res instanceof IDBRequest ? await promisify(res) : await res
    return value as T
  } finally {
    db.close()
  }
}

export async function putDoc(doc: StoredDoc): Promise<void> {
  await withStore(DOCS, 'readwrite', (s) => s.put(doc))
}

export async function getDoc(docId: string): Promise<StoredDoc | undefined> {
  return (await withStore<StoredDoc>(DOCS, 'readonly', (s) => s.get(docId))) ?? undefined
}

export async function deleteDoc(docId: string): Promise<void> {
  await withStore(DOCS, 'readwrite', (s) => s.delete(docId))
}

/** Patch just the annotation draft + timestamp for a stored doc (no-op if missing). */
export async function updateAnnotations(docId: string, annotations: unknown): Promise<void> {
  const existing = await getDoc(docId)
  if (!existing) return
  await putDoc({ ...existing, annotations, updatedAt: Date.now() })
}

export async function listDocs(): Promise<StoredDocMeta[]> {
  const all = (await withStore<StoredDoc[]>(DOCS, 'readonly', (s) => s.getAll())) ?? []
  return all
    .map(({ bytes, ...rest }) => ({ ...rest, hasBytes: bytes != null && bytes.byteLength > 0 }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function setCurrent(docId: string | null): Promise<void> {
  await withStore(META, 'readwrite', (s) =>
    docId == null ? s.delete(CURRENT_KEY) : s.put(docId, CURRENT_KEY),
  )
}

export async function getCurrent(): Promise<string | null> {
  return (await withStore<string>(META, 'readonly', (s) => s.get(CURRENT_KEY))) ?? null
}

/** Convenience: the full current document record (bytes + annotations), if any. */
export async function getCurrentDoc(): Promise<StoredDoc | undefined> {
  const id = await getCurrent()
  if (!id) return undefined
  return getDoc(id)
}
