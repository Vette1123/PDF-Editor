import { describe, it, expect } from 'vitest'
import { reducer, createHistory, applyWithHistory, undo, redo } from './reducer'
import { initialEditorState } from './types'

const addText = (page = 1) => ({ type: 'ADD_TEXT' as const, x: 10, y: 20, page })

describe('reducer', () => {
  it('adds a text annotation and selects it', () => {
    const s = reducer(initialEditorState, addText())
    expect(s.annotations).toHaveLength(1)
    expect(s.annotations[0].kind).toBe('text')
    expect(s.selectedId).toBe(s.annotations[0].id)
  })
  it('updates an annotation by id', () => {
    const s1 = reducer(initialEditorState, addText())
    const id = s1.annotations[0].id
    const s2 = reducer(s1, { type: 'UPDATE', id, patch: { x: 99 } })
    expect((s2.annotations[0] as { x: number }).x).toBe(99)
  })
  it('deletes and clears selection', () => {
    const s1 = reducer(initialEditorState, addText())
    const id = s1.annotations[0].id
    const s2 = reducer(s1, { type: 'DELETE', id })
    expect(s2.annotations).toHaveLength(0)
    expect(s2.selectedId).toBeNull()
  })
})

describe('history', () => {
  it('undo restores previous annotations; redo reapplies', () => {
    let h = createHistory(initialEditorState)
    h = applyWithHistory(h, addText())
    expect(h.present.annotations).toHaveLength(1)
    h = undo(h)
    expect(h.present.annotations).toHaveLength(0)
    h = redo(h)
    expect(h.present.annotations).toHaveLength(1)
  })
  it('undo at start is a no-op', () => {
    const h = createHistory(initialEditorState)
    expect(undo(h).present.annotations).toHaveLength(0)
  })
})
