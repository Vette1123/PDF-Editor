export type Tool = 'select' | 'text' | 'signature'

export type FontFamily =
  | 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Courier'

export interface TextAnnotation {
  kind: 'text'
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: FontFamily
  pageNumber: number
}

export interface SignatureAnnotation {
  kind: 'signature'
  id: string
  imageData: string // data URL (png or jpeg)
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
}

export type Annotation = TextAnnotation | SignatureAnnotation

export interface EditorState {
  annotations: Annotation[]
  selectedId: string | null
  tool: Tool
  currentPage: number
}

export type Action =
  | { type: 'ADD_TEXT'; x: number; y: number; page: number; fontFamily?: FontFamily }
  | { type: 'ADD_SIGNATURE'; imageData: string; page: number }
  | { type: 'UPDATE'; id: string; patch: Partial<TextAnnotation> & Partial<SignatureAnnotation> }
  | { type: 'DELETE'; id: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'RESET'; state?: Partial<EditorState> }

export const initialEditorState: EditorState = {
  annotations: [],
  selectedId: null,
  tool: 'select',
  currentPage: 1,
}
