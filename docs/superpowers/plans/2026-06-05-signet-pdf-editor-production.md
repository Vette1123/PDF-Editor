# Signet — Production PDF Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **UI styling note:** Tasks in Phase 3 (Editor) and Phase 4 (Landing) are UI-heavy. For those, invoke the **frontend-design** skill to produce the actual visual code. This plan fixes the *contract* (files, props, behavior, accessibility, tokens) — the frontend-design skill fills in the distinctive visual execution against the token system from Phase 0. Do NOT freeze pixel values here.

**Goal:** Transform the client-side PDF editor into "Signet" — a distinctive, production-grade, privacy-first browser PDF editor with a server-rendered SEO landing page, correct PDF export, full theming, accessibility, and tests.

**Architecture:** Split routes — `/` is a server-rendered marketing landing page (indexable); `/editor` is the client-only editor. Editor logic moves into a pure reducer + hook with an undo/redo history stack, making it unit-testable. Export, font-mapping, and color logic become pure modules covered by tests. A design-token system (CSS vars + Tailwind 4 `@theme`) drives a correct light + dark theme.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · pdf-lib (+ @pdf-lib/fontkit) · pdfjs-dist / react-pdf · react-signature-canvas · lucide-react · Vitest + @testing-library/react + jsdom.

---

## File Structure

```
app/
  layout.tsx              # MODIFY: theme provider, full base metadata, JSON-LD, fonts
  page.tsx                # REPLACE: server-rendered landing (was client editor)
  editor/page.tsx         # CREATE: client-only editor entry (dynamic import)
  robots.ts               # CREATE
  sitemap.ts              # CREATE
  manifest.ts             # CREATE
  opengraph-image.tsx     # CREATE: next/og generated image
  error.tsx               # CREATE: root error boundary
  not-found.tsx           # CREATE: branded 404
  globals.css             # MODIFY: tokens + @theme + keyframes
  pdf-viewer.css          # DELETE (dead)
lib/
  seo/site.ts             # CREATE: canonical site config
  seo/structured-data.ts  # CREATE: JSON-LD builders
  editor/types.ts         # CREATE
  editor/color.ts         # CREATE
  editor/fonts.ts         # CREATE
  editor/reducer.ts       # CREATE
  editor/export.ts        # CREATE
  editor/use-editor.ts    # CREATE
  pdf/worker.ts           # CREATE: self-hosted worker setup
components/
  ui/{Button,Tooltip,Toast,Dialog,Logo,ThemeToggle}.tsx   # CREATE
  ui/ThemeProvider.tsx                                     # CREATE
  editor/EditorShell.tsx                                   # CREATE (composition root)
  editor/{Toolbar,TopBar,DocumentCanvas,AnnotationLayer,Inspector,
          PageThumbnails,CommandPalette,SignatureModal,
          UploadDropzone,ExportMenu}.tsx                   # CREATE/REFACTOR
  landing/{Nav,Hero,FeatureGrid,HowItWorks,PrivacyCallout,FAQ,Footer}.tsx  # CREATE
  PDFEditor.tsx / PDFViewer.tsx / PDFUpload.tsx / TextPropertiesPanel.tsx  # DELETE after migration
test/
  setup.ts
vitest.config.ts
next.config.ts            # MODIFY: security headers, worker asset
```

---

## Phase 0 — Foundation

### Task 0.1: Install dependencies & test tooling

**Files:** Modify `package.json` (via npm).

- [ ] **Step 1: Install runtime + dev deps**

```bash
npm install @pdf-lib/fontkit
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Add scripts to `package.json`**

In `"scripts"` add:
```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3: Verify install**

Run: `npm run typecheck`
Expected: exits 0 (no type errors in current code).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add fontkit + vitest test tooling"
```

### Task 0.2: Vitest config

**Files:** Create `vitest.config.ts`, `test/setup.ts`.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['lib/**/*.test.ts', 'components/**/*.test.tsx'],
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
```

- [ ] **Step 2: Create `test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Smoke test**

Create `lib/editor/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```
Run: `npm test`
Expected: 1 passed. Then delete `lib/editor/smoke.test.ts`.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts test/setup.ts
git commit -m "chore: configure vitest + jsdom"
```

### Task 0.3: Design tokens & theme CSS

**Files:** Modify `app/globals.css`.

- [ ] **Step 1: Replace `app/globals.css`** with token system (dark default, `.light` override) — full file:

```css
@import 'tailwindcss';

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  /* dark-first (default) */
  --bg-canvas: #0a0a0b;
  --bg-panel: #141416;
  --bg-elevated: #1c1c1f;
  --border: #27272a;
  --border-strong: #3f3f46;
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --accent-ring: #6366f1;
  --success: #10b981;
  --danger: #f43f5e;
  --warning: #f59e0b;
  --shadow: 0 1px 0 0 rgb(255 255 255 / 4%) inset, 0 8px 24px -8px rgb(0 0 0 / 60%);
}

.light {
  --bg-canvas: #fafafa;
  --bg-panel: #ffffff;
  --bg-elevated: #ffffff;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --text: #18181b;
  --text-muted: #52525b;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-ring: #6366f1;
  --shadow: 0 1px 2px 0 rgb(0 0 0 / 6%), 0 8px 24px -12px rgb(0 0 0 / 12%);
}

@theme inline {
  --color-canvas: var(--bg-canvas);
  --color-panel: var(--bg-panel);
  --color-elevated: var(--bg-elevated);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-fg: var(--text);
  --color-fg-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-success: var(--success);
  --color-danger: var(--danger);
  --color-warning: var(--warning);
}

* { border-color: var(--border); }

body {
  background: var(--bg-canvas);
  color: var(--text);
  font-family: var(--font-sans), system-ui, sans-serif;
}

@keyframes blink { 0%,50%,100% { opacity: 1 } 25%,75% { opacity: 0 } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: build succeeds (current pages may warn; should not error on CSS).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: design-token system with light/dark themes"
```

### Task 0.4: Site config & self-hosted PDF worker

**Files:** Create `lib/seo/site.ts`, `lib/pdf/worker.ts`. Modify `next.config.ts`.

- [ ] **Step 1: Create `lib/seo/site.ts`**

```ts
export const site = {
  name: 'Signet',
  title: 'Signet — Edit & Sign PDFs Privately in Your Browser',
  shortDescription: 'Free, private, in-browser PDF editor.',
  description:
    'Signet is a free, privacy-first PDF editor. Add text, draw or type signatures, and export — entirely in your browser. No uploads, no accounts, your files never leave your device.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://signet.app',
  tagline: 'Edit & sign PDFs — privately, in your browser.',
  keywords: [
    'PDF editor', 'edit PDF online', 'sign PDF free', 'add text to PDF',
    'PDF signature', 'browser PDF editor', 'no upload PDF editor', 'private PDF editor',
  ],
  author: 'Mohamed Gado',
  authorUrl: 'https://mohamedgado.com',
  repo: 'https://github.com/Vette1123/PDF-Editor',
} as const
```

> **Author/portfolio:** `mohamedgado.com` must appear (a) on the OG image (Task 4.4) and (b) as a
> visible credit in the site `Footer` (Task 4.2: "Crafted by Mohamed Gado" → `authorUrl`,
> `rel="author"`). Also set `metadata.authors[].url` to `authorUrl` and add a `creator` field in
> Task 5.1.

- [ ] **Step 2: Create `lib/pdf/worker.ts`** (resolve worker from installed pdfjs version, no CDN)

```ts
import { pdfjs } from 'react-pdf'

// Self-host the worker matching the installed pdfjs-dist version.
// Vercel/Next bundles this URL; works offline and survives version bumps.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()
```

- [ ] **Step 3: Replace `next.config.ts`** with security headers + keep canvas alias

```ts
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add lib/seo/site.ts lib/pdf/worker.ts next.config.ts
git commit -m "feat: site config, self-hosted pdf worker, security headers"
```

---

## Phase 1 — State layer & correctness (TDD)

### Task 1.1: Editor types

**Files:** Create `lib/editor/types.ts`.

- [ ] **Step 1: Create `lib/editor/types.ts`**

```ts
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
  | { type: 'ADD_TEXT'; x: number; y: number; page: number }
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/editor/types.ts
git commit -m "feat: editor domain types"
```

### Task 1.2: Color parsing (TDD)

**Files:** Create `lib/editor/color.ts`, `lib/editor/color.test.ts`.

- [ ] **Step 1: Write failing test `lib/editor/color.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { hexToRgb01 } from './color'

describe('hexToRgb01', () => {
  it('parses #rrggbb', () => {
    expect(hexToRgb01('#ff0000')).toEqual({ r: 1, g: 0, b: 0 })
  })
  it('parses without hash and uppercase', () => {
    expect(hexToRgb01('00FF00')).toEqual({ r: 0, g: 1, b: 0 })
  })
  it('parses shorthand #rgb', () => {
    expect(hexToRgb01('#00f')).toEqual({ r: 0, g: 0, b: 1 })
  })
  it('falls back to black on garbage', () => {
    expect(hexToRgb01('not-a-color')).toEqual({ r: 0, g: 0, b: 0 })
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- color`
Expected: FAIL (`hexToRgb01` not defined).

- [ ] **Step 3: Implement `lib/editor/color.ts`**

```ts
export interface Rgb01 { r: number; g: number; b: number }

export function hexToRgb01(input: string): Rgb01 {
  const black: Rgb01 = { r: 0, g: 0, b: 0 }
  let hex = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(hex)) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-f]{6}$/.test(hex)) return black
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  }
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- color`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/editor/color.ts lib/editor/color.test.ts
git commit -m "feat: robust hex->rgb color parsing with tests"
```

### Task 1.3: Font mapping (TDD)

**Files:** Create `lib/editor/fonts.ts`, `lib/editor/fonts.test.ts`.

- [ ] **Step 1: Write failing test `lib/editor/fonts.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { StandardFonts } from 'pdf-lib'
import { toStandardFont, UI_FONTS } from './fonts'

describe('font mapping', () => {
  it('maps every UI font to a pdf-lib StandardFont', () => {
    for (const f of UI_FONTS) {
      expect(Object.values(StandardFonts)).toContain(toStandardFont(f.value))
    }
  })
  it('defaults unknown to Helvetica', () => {
    // @ts-expect-error testing fallback
    expect(toStandardFont('Nope')).toBe(StandardFonts.Helvetica)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- fonts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/editor/fonts.ts`**

```ts
import { StandardFonts } from 'pdf-lib'
import type { FontFamily } from './types'

export const UI_FONTS: { value: FontFamily; label: string; css: string }[] = [
  { value: 'Helvetica', label: 'Sans', css: 'Helvetica, Arial, sans-serif' },
  { value: 'Helvetica-Bold', label: 'Sans Bold', css: 'Helvetica, Arial, sans-serif' },
  { value: 'Times-Roman', label: 'Serif', css: '"Times New Roman", Times, serif' },
  { value: 'Courier', label: 'Mono', css: '"Courier New", Courier, monospace' },
]

export function toStandardFont(family: FontFamily): StandardFonts {
  switch (family) {
    case 'Helvetica': return StandardFonts.Helvetica
    case 'Helvetica-Bold': return StandardFonts.HelveticaBold
    case 'Times-Roman': return StandardFonts.TimesRoman
    case 'Courier': return StandardFonts.Courier
    default: return StandardFonts.Helvetica
  }
}

export function fontWeight(family: FontFamily): 'normal' | 'bold' {
  return family === 'Helvetica-Bold' ? 'bold' : 'normal'
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- fonts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/editor/fonts.ts lib/editor/fonts.test.ts
git commit -m "feat: UI->pdf-lib font mapping with tests"
```

### Task 1.4: Export coordinate math (TDD)

**Files:** Create `lib/editor/export.ts`, `lib/editor/export.test.ts`.

The viewer positions an annotation box by its top-left in CSS pixels at scale 1 (`annotation.x`,
`annotation.y` are unscaled doc coordinates). pdf-lib's origin is bottom-left and `drawText`'s `y`
is the text baseline. We therefore compute the baseline as
`pdfY = pageHeight - y - PADDING_TOP - ascentFromTop`, where the visible glyph top sits at
`y + PADDING_TOP` and the baseline is `~0.8 * fontSize` below the glyph top.

- [ ] **Step 1: Write failing test `lib/editor/export.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { screenToPdfBaseline, ANNOTATION_PADDING, BASELINE_RATIO } from './export'

describe('screenToPdfBaseline', () => {
  it('inverts Y and offsets to baseline', () => {
    const pageHeight = 800
    const y = 100      // top of annotation box in doc px
    const fontSize = 20
    const result = screenToPdfBaseline({ pageHeight, y, fontSize })
    const expected =
      pageHeight - y - ANNOTATION_PADDING - BASELINE_RATIO * fontSize
    expect(result).toBeCloseTo(expected, 5)
  })
  it('top of page maps near page height', () => {
    const r = screenToPdfBaseline({ pageHeight: 800, y: 0, fontSize: 12 })
    expect(r).toBeLessThan(800)
    expect(r).toBeGreaterThan(780)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- export`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/editor/export.ts`** (pure math + the impure exporter)

```ts
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { hexToRgb01 } from './color'
import { toStandardFont } from './fonts'
import type { Annotation, TextAnnotation, SignatureAnnotation } from './types'

export const ANNOTATION_PADDING = 2 // px, matches AnnotationLayer box padding-top
export const BASELINE_RATIO = 0.8   // baseline offset below glyph top, approx cap height

export function screenToPdfBaseline(args: {
  pageHeight: number
  y: number
  fontSize: number
}): number {
  const { pageHeight, y, fontSize } = args
  return pageHeight - y - ANNOTATION_PADDING - BASELINE_RATIO * fontSize
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; isPng: boolean } {
  const [meta, b64] = dataUrl.split(',')
  const isPng = meta.includes('image/png')
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return { bytes, isPng }
}

export async function exportPdf(
  sourceBytes: ArrayBuffer,
  annotations: Annotation[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sourceBytes)
  doc.registerFontkit(fontkit)
  const pages = doc.getPages()

  const texts = annotations.filter((a): a is TextAnnotation => a.kind === 'text')
  const sigs = annotations.filter((a): a is SignatureAnnotation => a.kind === 'signature')

  for (const t of texts) {
    const page = pages[t.pageNumber - 1]
    if (!page) continue
    const font = await doc.embedFont(toStandardFont(t.fontFamily))
    const { height } = page.getSize()
    const { r, g, b } = hexToRgb01(t.color)
    page.drawText(t.text, {
      x: t.x + ANNOTATION_PADDING,
      y: screenToPdfBaseline({ pageHeight: height, y: t.y, fontSize: t.fontSize }),
      size: t.fontSize,
      font,
      color: rgb(r, g, b),
    })
  }

  for (const s of sigs) {
    const page = pages[s.pageNumber - 1]
    if (!page) continue
    const { height } = page.getSize()
    const { bytes, isPng } = dataUrlToBytes(s.imageData)
    const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    page.drawImage(img, {
      x: s.x,
      y: height - s.y - s.height,
      width: s.width,
      height: s.height,
    })
  }

  return doc.save()
}

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- export`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/editor/export.ts lib/editor/export.test.ts
git commit -m "feat: PDF export with font embedding + tested coordinate math"
```

### Task 1.5: Reducer with undo/redo (TDD)

**Files:** Create `lib/editor/reducer.ts`, `lib/editor/reducer.test.ts`.

- [ ] **Step 1: Write failing test `lib/editor/reducer.test.ts`**

```ts
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
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- reducer`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/editor/reducer.ts`**

```ts
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
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- reducer`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/editor/reducer.ts lib/editor/reducer.test.ts
git commit -m "feat: editor reducer with undo/redo history + tests"
```

### Task 1.6: `useEditor` hook

**Files:** Create `lib/editor/use-editor.ts`.

- [ ] **Step 1: Create `lib/editor/use-editor.ts`**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/editor/use-editor.ts
git commit -m "feat: useEditor hook wrapping reducer + history"
```

---

## Phase 2 — UI primitives

> Invoke **frontend-design** skill for visual execution. Each primitive uses the Phase 0 tokens
> (`bg-panel`, `text-fg`, `border-border`, `accent`, etc. via Tailwind arbitrary `bg-[var(--bg-panel)]`
> or the `@theme inline` color names). All must be accessible.

### Task 2.1: ThemeProvider + ThemeToggle

**Files:** Create `components/ui/ThemeProvider.tsx`, `components/ui/ThemeToggle.tsx`.

- [ ] **Step 1: Create `components/ui/ThemeProvider.tsx`**

```tsx
'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark', toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    const initial = stored ?? (prefersLight ? 'light' : 'dark')
    setTheme(initial)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
```

- [ ] **Step 2: Create `components/ui/ThemeToggle.tsx`** (Sun/Moon icons, `aria-label`)

```tsx
'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

- [ ] **Step 3: Typecheck & commit**

Run: `npm run typecheck` (expect 0 errors)
```bash
git add components/ui/ThemeProvider.tsx components/ui/ThemeToggle.tsx
git commit -m "feat: theme provider + toggle"
```

### Task 2.2: Button, Tooltip, Logo

**Files:** Create `components/ui/Button.tsx`, `components/ui/Tooltip.tsx`, `components/ui/Logo.tsx`.

- [ ] **Step 1: Create `components/ui/Button.tsx`** — variants `primary | ghost | danger`, sizes, focus ring, forwardRef.

```tsx
'use client'
import { forwardRef } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]',
  danger: 'text-[var(--danger)] hover:bg-[var(--danger)]/10',
}
const sizes: Record<Size, string> = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm' }

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', ...props }, ref) => (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  ),
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Create `components/ui/Tooltip.tsx`** — CSS-only hover/focus tooltip with `role="tooltip"` (lightweight; no extra dep). Accepts `label`, `side`, children.

```tsx
'use client'
export function Tooltip({
  label, children, side = 'right',
}: { label: string; children: React.ReactNode; side?: 'right' | 'bottom' }) {
  const pos = side === 'right'
    ? 'left-full top-1/2 -translate-y-1/2 ml-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2'
  return (
    <span className="relative group inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos} z-50 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity`}
      >
        {label}
      </span>
    </span>
  )
}
```

- [ ] **Step 3: Create `components/ui/Logo.tsx`** — Signet wordmark + seal mark (inline SVG dot + lowercase `signet`).

```tsx
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3.5" fill="var(--accent)" />
      </svg>
      <span className="text-[var(--text)]">signet</span>
    </span>
  )
}
```

- [ ] **Step 4: Typecheck & commit**

Run: `npm run typecheck` (expect 0)
```bash
git add components/ui/Button.tsx components/ui/Tooltip.tsx components/ui/Logo.tsx
git commit -m "feat: Button, Tooltip, Logo primitives"
```

### Task 2.3: Toast system

**Files:** Create `components/ui/Toast.tsx`. Test `components/ui/Toast.test.tsx`.

- [ ] **Step 1: Write failing test `components/ui/Toast.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from './Toast'

function Trigger() {
  const { toast } = useToast()
  return <button onClick={() => toast({ message: 'Saved!', kind: 'success' })}>go</button>
}

describe('Toast', () => {
  it('shows a toast on demand', () => {
    render(<ToastProvider><Trigger /></ToastProvider>)
    act(() => { screen.getByText('go').click() })
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- Toast`
Expected: FAIL.

- [ ] **Step 3: Implement `components/ui/Toast.tsx`** — provider, `useToast().toast(...)`, auto-dismiss, `role="status"`, `aria-live="polite"`.

```tsx
'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

type Kind = 'success' | 'error' | 'info'
interface Item { id: number; message: string; kind: Kind }
const ToastCtx = createContext<{ toast: (t: { message: string; kind?: Kind }) => void }>({
  toast: () => {},
})

let nextId = 0
const icons = { success: CheckCircle2, error: XCircle, info: Info }
const tints = {
  success: 'text-[var(--success)]', error: 'text-[var(--danger)]', info: 'text-[var(--accent)]',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const toast = useCallback(({ message, kind = 'info' }: { message: string; kind?: Kind }) => {
    const id = nextId++
    setItems((xs) => [...xs, { id, message, kind }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {items.map((it) => {
          const Icon = icons[it.kind]
          return (
            <div key={it.id} role="status"
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] shadow-[var(--shadow)]">
              <Icon size={16} className={tints[it.kind]} />
              {it.message}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- Toast`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Toast.tsx components/ui/Toast.test.tsx
git commit -m "feat: accessible toast system with test"
```

### Task 2.4: Accessible Dialog (focus trap)

**Files:** Create `components/ui/Dialog.tsx`.

- [ ] **Step 1: Implement `components/ui/Dialog.tsx`** — overlay, `role="dialog"` `aria-modal`, ESC to close, focus trap, restores focus, scroll lock.

```tsx
'use client'
import { useEffect, useRef } from 'react'

export function Dialog({
  open, onClose, label, children,
}: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement as HTMLElement
    const node = ref.current
    const focusable = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && focusable && focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow)]">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck & commit**

Run: `npm run typecheck` (expect 0)
```bash
git add components/ui/Dialog.tsx
git commit -m "feat: accessible focus-trapped Dialog"
```

---

## Phase 3 — Editor redesign

> Invoke **frontend-design** skill for the visual layer of every task in this phase. Behavior,
> props, and accessibility below are the contract; the skill supplies the distinctive styling using
> Phase 0 tokens. Reuse Phase 2 primitives. Verify `npm run typecheck` after each task.

### Task 3.1: UploadDropzone

**Files:** Create `components/editor/UploadDropzone.tsx`. Test `components/editor/UploadDropzone.test.tsx`.

**Contract:** Props `{ onFile: (file: File) => void; maxBytes?: number }`. Centered dropzone, drag
state, click-to-pick, validates `application/pdf` and size; invalid → calls `useToast().toast` with
an error and does not call `onFile`. Privacy line ("Files never leave your device"). Keyboard
focusable, `aria-label`.

- [ ] **Step 1: Write failing test `components/editor/UploadDropzone.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '@/components/ui/Toast'
import { UploadDropzone } from './UploadDropzone'

function setup(onFile = vi.fn()) {
  render(<ToastProvider><UploadDropzone onFile={onFile} /></ToastProvider>)
  return onFile
}

describe('UploadDropzone', () => {
  it('accepts a PDF via the hidden input', async () => {
    const onFile = setup()
    const file = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/upload pdf/i) as HTMLInputElement
    await userEvent.upload(input, file)
    expect(onFile).toHaveBeenCalledWith(file)
  })
  it('rejects a non-PDF', async () => {
    const onFile = setup()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload pdf/i) as HTMLInputElement
    await userEvent.upload(input, file)
    expect(onFile).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — expect FAIL** — `npm test -- UploadDropzone`

- [ ] **Step 3: Implement `components/editor/UploadDropzone.tsx`**

Hidden `<input type="file" accept="application/pdf" aria-label="Upload PDF">` + drag handlers.
Validation: `file.type !== 'application/pdf'` → `toast({kind:'error', message:'Please choose a PDF file.'})`; `file.size > maxBytes` (default 50MB) → error toast. Otherwise `onFile(file)`. Reset input value after pick. Styling via frontend-design + tokens.

- [ ] **Step 4: Run — expect PASS** — `npm test -- UploadDropzone`

- [ ] **Step 5: Commit**

```bash
git add components/editor/UploadDropzone.tsx components/editor/UploadDropzone.test.tsx
git commit -m "feat: redesigned accessible upload dropzone with validation"
```

### Task 3.2: SignatureModal (self-hosted fonts)

**Files:** Create `components/editor/SignatureModal.tsx`. Add fonts to `app/layout.tsx` (Task 5.1 wires `next/font/google` for handwriting faces: Caveat, Dancing Script, Great Vibes, Sacramento). Test `SignatureModal.test.tsx`.

**Contract:** Props `{ open; onClose; onSave: (dataUrl: string) => void }`. Wraps Phase 2 `Dialog`
(focus trap, ESC). Tabs Draw / Type / Upload. Type mode lists the bundled handwriting fonts (CSS
variables exposed by `next/font`), live canvas preview rendered after `await document.fonts.ready`.
Save returns a PNG data URL. Draw uses `react-signature-canvas`. Upload reads an image to data URL.

- [ ] **Step 1: Write failing test `components/editor/SignatureModal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignatureModal } from './SignatureModal'

describe('SignatureModal', () => {
  it('switches to Type mode and shows the name input', async () => {
    render(<SignatureModal open onClose={vi.fn()} onSave={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: /type/i }))
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL** — `npm test -- SignatureModal`

- [ ] **Step 3: Implement** the modal. Mode tabs use `role="tab"`/`role="tabpanel"`. Type-mode canvas render:

```ts
// inside an effect that depends on [text, font, mode]
await (document as Document).fonts.ready
const ctx = canvas.getContext('2d')!
ctx.clearRect(0, 0, canvas.width, canvas.height)
ctx.font = `64px '${font.cssName}'`
ctx.fillStyle = '#000'
ctx.textBaseline = 'middle'
ctx.fillText(text, 12, canvas.height / 2)
```
Save: draw mode → `sigCanvas.toDataURL('image/png')`; type mode → trimmed canvas `toDataURL('image/png')`; upload → `FileReader.readAsDataURL`. Empty input → error toast, no save.

- [ ] **Step 4: Run — expect PASS** — `npm test -- SignatureModal`

- [ ] **Step 5: Commit**

```bash
git add components/editor/SignatureModal.tsx components/editor/SignatureModal.test.tsx
git commit -m "feat: accessible signature modal with self-hosted handwriting fonts"
```

### Task 3.3: AnnotationLayer (pointer events, touch + mouse)

**Files:** Create `components/editor/AnnotationLayer.tsx`.

**Contract:** Props `{ annotations; scale; tool; selectedId; onSelect; onUpdate; onStartEditText }`.
Renders text + signature boxes for one page (parent filters by page). Drag and resize use **pointer
events** (`onPointerDown/Move/Up` + `setPointerCapture`, `touch-action: none` on handles) so it
works on touch. Selected box shows accent border + a resize handle. Text box: double-click (or Enter
when selected) enters inline edit. Arrow keys nudge selected by 1px (Shift = 10px). Resize updates
`fontSize` for text, proportional `width/height` for signatures. Every interactive box has
`role="button"` + `aria-label`.

- [ ] **Step 1: Implement** the component (pointer-event drag/resize ported from old `PDFViewer`, converted from mouse to pointer events; positions multiplied by `scale` for display, divided by `scale` when writing back).
- [ ] **Step 2: Typecheck** — `npm run typecheck` (expect 0)
- [ ] **Step 3: Commit**

```bash
git add components/editor/AnnotationLayer.tsx
git commit -m "feat: pointer-based annotation layer (touch + mouse drag/resize)"
```

### Task 3.4: DocumentCanvas

**Files:** Create `components/editor/DocumentCanvas.tsx`. Imports `lib/pdf/worker`.

**Contract:** Props `{ file; scale; tool; annotations; selectedId; currentPage; dispatch; onNumPages }`.
Renders `react-pdf` `<Document><Page/></Document>` for all pages with `renderTextLayer={false}`
`renderAnnotationLayer={false}`, dot-grid backdrop. Clicking a page with the text tool dispatches
`ADD_TEXT` at cursor (÷ scale). Overlays `AnnotationLayer` per page. Caret preview at hover when text
tool active. Sets `pageRefs` for coordinate math. Loading + error render states (spinner / message).

- [ ] **Step 1: Implement** (port rendering from old `PDFViewer`, wire to dispatch + AnnotationLayer; add `onLoadError` → error state).
- [ ] **Step 2: Typecheck** — expect 0
- [ ] **Step 3: Commit**

```bash
git add components/editor/DocumentCanvas.tsx
git commit -m "feat: document canvas with react-pdf + annotation overlay"
```

### Task 3.5: Toolbar, TopBar, Inspector, ExportMenu, PageThumbnails

**Files:** Create the five components under `components/editor/`.

**Contracts:**
- `Toolbar` `{ tool; onTool; hasSelection; onDelete }` — vertical rail; Select(V)/Text(T)/Signature(S) buttons with `Tooltip` showing the key; active = accent; Delete (danger) when `hasSelection`. Each button `aria-pressed` + `aria-label`.
- `TopBar` `{ filename; onRename; page; numPages; onPage; scale; onZoom; onFit; canUndo; canRedo; onUndo; onRedo; onExport }` — inline rename input, page nav with mono `page/total`, zoom out/in with mono `%`, fit-width, undo/redo (disabled states), `ExportMenu`, `ThemeToggle`, `Logo`.
- `Inspector` `{ selected; onUpdate }` — docked right panel. Text → content textarea, font family (`UI_FONTS`), size select, color swatches + native picker. Signature → width slider + opacity. Empty → hint text. All inputs labeled.
- `ExportMenu` `{ onDownload }` — `Button variant="primary"` "Export" with a small dropdown ("Download PDF"); room for future options. Closes on outside click / ESC.
- `PageThumbnails` `{ file; numPages; current; onJump; collapsed; onToggle }` — `react-pdf` thumbnails at small scale; current highlighted; collapsible.

- [ ] **Step 1: Implement all five** using Phase 2 primitives + tokens (frontend-design skill for visuals).
- [ ] **Step 2: Typecheck** — expect 0
- [ ] **Step 3: Commit**

```bash
git add components/editor/Toolbar.tsx components/editor/TopBar.tsx components/editor/Inspector.tsx components/editor/ExportMenu.tsx components/editor/PageThumbnails.tsx
git commit -m "feat: toolbar, top bar, inspector, export menu, thumbnails"
```

### Task 3.6: CommandPalette (⌘K)

**Files:** Create `components/editor/CommandPalette.tsx`.

**Contract:** Props `{ open; onClose; commands: { id; label; hint?; run: () => void }[] }`. Opens on
⌘K/Ctrl-K (listener lives in EditorShell). Fuzzy filter input, arrow-key navigation, Enter runs,
ESC closes. Wraps `Dialog` styling (smaller). `role="listbox"`/`option`.

- [ ] **Step 1: Implement.** Filter by case-insensitive substring; highlight active index.
- [ ] **Step 2: Typecheck** — expect 0
- [ ] **Step 3: Commit**

```bash
git add components/editor/CommandPalette.tsx
git commit -m "feat: command palette (cmdk-style) for editor actions"
```

### Task 3.7: EditorShell (composition root) + replace PDFEditor

**Files:** Create `components/editor/EditorShell.tsx`. Delete `components/PDFEditor.tsx`, `PDFViewer.tsx`, `PDFUpload.tsx`, `TextPropertiesPanel.tsx`, `app/pdf-viewer.css`.

**Contract:** Top-level client component. Holds: `useEditor()`, `file`/`arrayBuffer` state, `scale`,
`numPages`, signature-modal + palette open flags, filename. Wires:
- file upload → read `arrayBuffer`, reset editor (`RESET`).
- export → `exportPdf(arrayBuffer, state.annotations)` then `downloadBytes`; toast on success/failure; guard no-file.
- global keys: V/T/S tools, Del/Backspace delete selection (not while typing in input), ⌘Z/⌘⇧Z undo/redo, ⌘K palette, ESC deselect.
- builds `commands` array for the palette.
- layout: `Toolbar | (TopBar + DocumentCanvas + PageThumbnails) | Inspector`; renders `SignatureModal`, `CommandPalette`.

- [ ] **Step 1: Implement EditorShell** wiring all Phase 3 components + `useEditor`.
- [ ] **Step 2: Delete legacy files**

```bash
git rm components/PDFEditor.tsx components/PDFViewer.tsx components/PDFUpload.tsx components/TextPropertiesPanel.tsx app/pdf-viewer.css
```

- [ ] **Step 3: Typecheck** — expect 0
- [ ] **Step 4: Commit**

```bash
git add components/editor/EditorShell.tsx
git commit -m "feat: EditorShell composition root; remove legacy components"
```

### Task 3.8: `/editor` route

**Files:** Create `app/editor/page.tsx`.

- [ ] **Step 1: Create `app/editor/page.tsx`**

```tsx
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { site } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: `Editor — ${site.name}`,
  description: site.description,
  alternates: { canonical: '/editor' },
}

const EditorShell = dynamic(() => import('@/components/editor/EditorShell'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center text-[var(--text-muted)]">
      Loading editor…
    </div>
  ),
})

export default function EditorPage() {
  return <main className="h-screen bg-[var(--bg-canvas)]"><EditorShell /></main>
}
```

> Note: `EditorShell` must `export default`.

- [ ] **Step 2: Run dev build sanity** — `npm run build` (expect success)
- [ ] **Step 3: Commit**

```bash
git add app/editor/page.tsx
git commit -m "feat: /editor route (client-only)"
```

---

## Phase 4 — Landing page & SEO

### Task 4.1: JSON-LD structured data

**Files:** Create `lib/seo/structured-data.ts`. Test `lib/seo/structured-data.test.ts`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { softwareAppLd, faqLd } from './structured-data'

describe('structured data', () => {
  it('builds SoftwareApplication LD with required fields', () => {
    const ld = softwareAppLd()
    expect(ld['@type']).toBe('SoftwareApplication')
    expect(ld.offers.price).toBe('0')
  })
  it('builds FAQPage LD from Q/A pairs', () => {
    const ld = faqLd([{ q: 'Is it free?', a: 'Yes.' }])
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe('Yes.')
  })
})
```

- [ ] **Step 2: Run — expect FAIL** — `npm test -- structured-data`

- [ ] **Step 3: Implement `lib/seo/structured-data.ts`**

```ts
import { site } from './site'

export function softwareAppLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    description: site.description,
    url: site.url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}
```

- [ ] **Step 4: Run — expect PASS** — `npm test -- structured-data`

- [ ] **Step 5: Commit**

```bash
git add lib/seo/structured-data.ts lib/seo/structured-data.test.ts
git commit -m "feat: JSON-LD structured data builders with tests"
```

### Task 4.2: Landing components

**Files:** Create `components/landing/{Nav,Hero,FeatureGrid,HowItWorks,PrivacyCallout,FAQ,Footer}.tsx`.

> Invoke **frontend-design** skill. These are **server components** (no `'use client'`) except `Nav`
> (needs `ThemeToggle`). All content static. Use Phase 0 tokens. The FAQ data is shared with §4.1
> `faqLd` — define the Q/A array in `components/landing/faq-data.ts` and import in both.

**Contracts (content):**
- `faq-data.ts` — exports `FAQ_ITEMS: { q: string; a: string }[]` (≥5: is it free, do files upload, file size limit, which browsers, can I sign).
- `Nav` — Logo + links (Features, How it works, FAQ) + `ThemeToggle` + primary CTA "Open editor" → `/editor`.
- `Hero` — H1 with primary keyword ("Edit & sign PDFs, free and private"), subhead, CTA buttons, trust line ("No upload · No account · 100% in your browser").
- `FeatureGrid` — 6 cards (text, signatures, drag-position, zoom/pages, export, privacy) with Lucide icons.
- `HowItWorks` — 3 steps (Upload → Edit & sign → Export).
- `PrivacyCallout` — emphasis band: files never leave the device.
- `FAQ` — accordion (details/summary, no JS needed) from `FAQ_ITEMS`.
- `Footer` — Logo, copyright, GitHub link (`site.repo`), and a visible **"Crafted by Mohamed Gado"**
  credit linking to `site.authorUrl` (`https://mohamedgado.com`, `rel="author"`, opens new tab).

- [ ] **Step 1: Implement `faq-data.ts` + all 7 components.**
- [ ] **Step 2: Typecheck** — expect 0
- [ ] **Step 3: Commit**

```bash
git add components/landing
git commit -m "feat: landing page sections (server-rendered)"
```

### Task 4.3: Landing page route + JSON-LD injection

**Files:** Replace `app/page.tsx`.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PrivacyCallout } from '@/components/landing/PrivacyCallout'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { FAQ_ITEMS } from '@/components/landing/faq-data'
import { softwareAppLd, faqLd } from '@/lib/seo/structured-data'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd()) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(FAQ_ITEMS)) }} />
      <Nav />
      <main>
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <PrivacyCallout />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Build** — `npm run build` (expect `/` rendered as static).
- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: server-rendered landing page with JSON-LD"
```

### Task 4.4: robots, sitemap, manifest, OG image

**Files:** Create `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/opengraph-image.tsx`.

- [ ] **Step 1: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/lib/seo/site'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
```

- [ ] **Step 2: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/lib/seo/site'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/editor`, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
```

- [ ] **Step 3: Create `app/manifest.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/lib/seo/site'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.name,
    description: site.shortDescription,
    start_url: '/editor',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
```

- [ ] **Step 4: Create `app/opengraph-image.tsx`** (next/og)

```tsx
import { ImageResponse } from 'next/og'
import { site } from '@/lib/seo/site'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function Og() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 80, background: '#0a0a0b', color: '#fafafa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, border: '4px solid #6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: '#6366f1' }} />
          </div>
          <div style={{ fontSize: 64, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ fontSize: 34, color: '#a1a1aa', marginTop: 24 }}>{site.tagline}</div>
        <div style={{ fontSize: 22, color: '#71717a', marginTop: 'auto' }}>
          {site.authorUrl.replace('https://', '')}
        </div>
      </div>
    ),
    { ...size },
  )
}
```

- [ ] **Step 5: Add favicon + manifest icon.** Create `app/icon.svg` (App Router auto-favicon —
  the Signet seal mark) AND `public/icon.svg` (referenced by manifest). Also create
  `app/apple-icon.png` is optional; SVG favicon is sufficient. Delete the stock `app/favicon.ico`
  (replaced by `app/icon.svg`).

`app/icon.svg` / `public/icon.svg` content:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="#0a0a0b"/>
  <circle cx="16" cy="16" r="9.5" fill="none" stroke="#6366f1" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="4" fill="#6366f1"/>
</svg>
```

- [ ] **Step 6: Build & commit**

Run: `npm run build` (expect success)
```bash
git rm app/favicon.ico
git add app/robots.ts app/sitemap.ts app/manifest.ts app/opengraph-image.tsx app/icon.svg public/icon.svg
git commit -m "feat: robots, sitemap, manifest, OG image (with portfolio), favicon"
```

---

## Phase 5 — Hardening & polish

### Task 5.1: Root layout — fonts, metadata, providers

**Files:** Modify `app/layout.tsx`.

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Caveat, Dancing_Script, Great_Vibes, Sacramento } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { site } from '@/lib/seo/site'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const caveat = Caveat({ variable: '--font-caveat', subsets: ['latin'] })
const dancing = Dancing_Script({ variable: '--font-dancing', subsets: ['latin'] })
const greatVibes = Great_Vibes({ variable: '--font-great-vibes', weight: '400', subsets: ['latin'] })
const sacramento = Sacramento({ variable: '--font-sacramento', weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.author, url: site.authorUrl }],
  creator: site.author,
  publisher: site.author,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', url: site.url, siteName: site.name,
    title: site.title, description: site.description,
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
}

const fontVars = [geistSans, geistMono, caveat, dancing, greatVibes, sacramento]
  .map((f) => f.variable).join(' ')

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVars} antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

> The handwriting font CSS variables (`--font-caveat`, etc.) are referenced by `SignatureModal`
> (Task 3.2) via a small `HANDWRITING_FONTS` map: `{ label, cssName, varClass }`.

- [ ] **Step 2: Build** — expect success
- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: root layout — fonts, full metadata, theme + toast providers"
```

### Task 5.2: Error boundary & 404

**Files:** Create `app/error.tsx`, `app/not-found.tsx`.

- [ ] **Step 1: Create `app/error.tsx`** (client; reset button)

```tsx
'use client'
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg-canvas)] p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Something went wrong</h1>
        <p className="mt-2 text-[var(--text-muted)]">An unexpected error occurred. Your files were never uploaded.</p>
        <button onClick={reset}
          className="mt-6 h-10 px-4 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          Try again
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/not-found.tsx`**

```tsx
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg-canvas)] p-6 text-center">
      <div>
        <Logo className="text-xl justify-center" />
        <h1 className="mt-6 text-2xl font-semibold text-[var(--text)]">Page not found</h1>
        <Link href="/" className="mt-6 inline-block h-10 px-4 leading-10 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          Back home
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Build & commit**

Run: `npm run build` (expect success)
```bash
git add app/error.tsx app/not-found.tsx
git commit -m "feat: error boundary + branded 404"
```

### Task 5.3: Full verification pass

**Files:** none (verification). Optionally update `README.md`, `FEATURES.md`.

- [ ] **Step 1: Type + lint + test + build**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
Expected: all green.

- [ ] **Step 2: Manual verify (uses `verify` / `run` skill or manual)**
  - `npm run dev`; load `/` — confirm server-rendered content (View Source shows hero/FAQ text).
  - `/editor` — upload a PDF, add text + signature, drag/resize (mouse **and** touch via devtools), undo/redo, ⌘K, theme toggle.
  - Export; open the output; confirm text/signature land where placed and fonts are correct.
- [ ] **Step 3: Lighthouse** on `/` (SEO/Best-Practices/Accessibility ≥ 95) and `/editor` (no critical a11y errors). Record results.
- [ ] **Step 4: Update README** — rename to Signet, update features, add deploy-to-Vercel + `NEXT_PUBLIC_SITE_URL` env note.
- [ ] **Step 5: Commit**

```bash
git add README.md FEATURES.md
git commit -m "docs: update README/FEATURES for Signet; record verification"
```

---

## Self-Review

**Spec coverage:**
- §1 redesign → Phases 0,2,3 ✓ · correctness → Phase 1 + 3.2/3.3 ✓ · SEO/landing → Phase 4 + 5.1 ✓ · hardening → Phase 5 ✓
- §2 routes (`/` landing, `/editor`) → Tasks 4.3, 3.8 ✓ · state layer (types/reducer/use-editor/export/fonts/color) → Phase 1 ✓ · component structure → Phases 2–4 ✓
- §3 visual system (tokens, light+dark, mono) → Task 0.3, 2.1 ✓
- §4 editor UX (rail, top bar, inspector, thumbnails, palette, signature modal, feedback, a11y, keyboard) → Tasks 3.1–3.8 ✓
- §5 correctness (export fidelity, typed fonts, self-hosted worker, undo/redo, input handling, color, cleanup) → Tasks 0.4, 1.2–1.6, 3.2, 3.7 ✓
- §6 SEO/production (landing, metadata, JSON-LD, robots/sitemap/manifest/OG, headers, error/404, perf) → Tasks 0.4, 4.1–4.4, 5.1–5.3 ✓
- §7 testing (vitest, unit on color/fonts/export/reducer, component on dropzone/signature/toast) → Tasks 0.2, 1.2–1.5, 2.3, 3.1, 3.2, 4.1 ✓

**Placeholder scan:** Logic tasks (Phase 1, 2.3, 4.1) contain full code + tests. UI tasks (Phases 2–4) intentionally specify contracts + key code and defer *styling* to the frontend-design skill — this is called out in the header, not a hidden placeholder.

**Type consistency:** `Annotation` is a discriminated union on `kind`; reducer/export/use-editor use the same `Action`, `EditorState`, `History` names and `applyWithHistory`/`undo`/`redo`/`canUndo`/`canRedo` signatures throughout. `toStandardFont`/`UI_FONTS`/`hexToRgb01`/`screenToPdfBaseline`/`exportPdf`/`downloadBytes` names match across Tasks 1.2–1.4 and EditorShell. `FAQ_ITEMS` shared between 4.2 and 4.3/4.1.

**Gaps fixed inline:** Added `faq-data.ts` as the shared source for FAQ content + JSON-LD; specified `EditorShell` default export consumed by `/editor`; noted handwriting-font CSS-var wiring between layout (5.1) and SignatureModal (3.2).
