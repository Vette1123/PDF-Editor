import { EditorState, Action, Annotation, TextAnnotation, SignatureAnnotation } from './types'

let counter = 0
const id = (p: string) => `${p}-${Date.now()}-${counter++}`

export function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'ADD_TEXT': {
      const a: TextAnnotation = {
        kind: 'text', id: id('text'), text: 'Type here',
        x: action.x, y: action.y, fontSize: 16, color: '#000000',
        fontFamily: 'Helvetica', pageNumber: action.page,
      }
      return { ...state, annotations: [...state.annotations, a], selectedId: a.id }
    }
    case 'ADD_SIGNATURE': {
      const a: SignatureAnnotation = {
        kind: 'signature', id: id('sig'), imageData: action.imageData,
        x: 150, y: 200, width: 200, height: 100, pageNumber: action.page,
      }
      return { ...state, annotations: [...state.annotations, a], selectedId: a.id }
    }
    case 'UPDATE':
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.id ? ({ ...a, ...action.patch } as Annotation) : a,
        ),
      }
    case 'DELETE':
      return {
        ...state,
        annotations: state.annotations.filter((a) => a.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      }
    case 'SELECT': return { ...state, selectedId: action.id }
    case 'SET_TOOL': return { ...state, tool: action.tool }
    case 'SET_PAGE': return { ...state, currentPage: action.page }
    case 'RESET': return { ...initialEditorStateRef(), ...action.state }
    default: return state
  }
}

function initialEditorStateRef(): EditorState {
  return { annotations: [], selectedId: null, tool: 'select', currentPage: 1 }
}

// ---- History (annotations + selection only) ----
const HISTORY_LIMIT = 50
export interface History { past: EditorState[]; present: EditorState; future: EditorState[] }
export const createHistory = (present: EditorState): History => ({ past: [], present, future: [] })

const mutatesDoc = (t: Action['type']) =>
  t === 'ADD_TEXT' || t === 'ADD_SIGNATURE' || t === 'UPDATE' || t === 'DELETE'

export function applyWithHistory(h: History, action: Action): History {
  const next = reducer(h.present, action)
  if (!mutatesDoc(action.type)) return { ...h, present: next }
  const past = [...h.past, h.present].slice(-HISTORY_LIMIT)
  return { past, present: next, future: [] }
}

export function undo(h: History): History {
  if (h.past.length === 0) return h
  const previous = h.past[h.past.length - 1]
  return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] }
}

export function redo(h: History): History {
  if (h.future.length === 0) return h
  const next = h.future[0]
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1) }
}

export const canUndo = (h: History) => h.past.length > 0
export const canRedo = (h: History) => h.future.length > 0
