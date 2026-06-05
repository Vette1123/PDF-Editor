'use client'
import { useCallback, useMemo, useReducer } from 'react'
import {
  History, createHistory, applyWithHistory, undo, redo, canUndo, canRedo,
} from './reducer'
import { Action, initialEditorState } from './types'

type HAction = Action | { type: 'UNDO' } | { type: 'REDO' }

function historyReducer(h: History, action: HAction): History {
  if (action.type === 'UNDO') return undo(h)
  if (action.type === 'REDO') return redo(h)
  return applyWithHistory(h, action)
}

export function useEditor() {
  const [history, dispatchRaw] = useReducer(historyReducer, undefined, () =>
    createHistory(initialEditorState),
  )
  const dispatch = useCallback((a: HAction) => dispatchRaw(a), [])
  const state = history.present
  return useMemo(
    () => ({ state, dispatch, canUndo: canUndo(history), canRedo: canRedo(history) }),
    [state, dispatch, history],
  )
}
