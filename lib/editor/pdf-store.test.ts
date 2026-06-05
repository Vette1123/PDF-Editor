import { describe, it, expect } from 'vitest'
import {
  newDocId,
  getDoc,
  getCurrent,
  getCurrentDoc,
  listDocs,
  putDoc,
  setCurrent,
} from './pdf-store'

describe('newDocId', () => {
  it('returns a non-empty unique string', () => {
    const a = newDocId()
    const b = newDocId()
    expect(typeof a).toBe('string')
    expect(a.length).toBeGreaterThan(0)
    expect(a).not.toBe(b)
  })
})

// jsdom provides no IndexedDB, so these exercise the graceful no-op guards:
// reads resolve to empty values and writes resolve without throwing.
describe('IndexedDB guards (no IndexedDB available)', () => {
  it('reads degrade to empty results', async () => {
    expect(await getDoc('missing')).toBeUndefined()
    expect(await getCurrent()).toBeNull()
    expect(await getCurrentDoc()).toBeUndefined()
    expect(await listDocs()).toEqual([])
  })

  it('writes resolve without throwing', async () => {
    await expect(
      putDoc({ docId: 'x', name: 'n', bytes: new ArrayBuffer(0), pageCount: 0, annotations: [], updatedAt: 1 }),
    ).resolves.toBeUndefined()
    await expect(setCurrent('x')).resolves.toBeUndefined()
    await expect(setCurrent(null)).resolves.toBeUndefined()
  })
})
