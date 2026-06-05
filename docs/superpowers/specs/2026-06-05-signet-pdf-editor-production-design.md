# Signet — Production-Grade Browser PDF Editor

**Date:** 2026-06-05
**Status:** Approved for planning
**Scope:** Full production pass — redesign, correctness fixes, SEO/landing, production hardening, tests.

---

## 1. Summary

Transform the existing client-side PDF editor (`Vette1123/PDF-Editor`) into **Signet**: a
distinctive, production-grade, privacy-first PDF editor that runs entirely in the browser.
Tagline: *"Edit & sign PDFs — privately, in your browser."*

The work has four pillars:

1. **Redesign** — a dark-first "precision pro-tool" aesthetic (Linear/Vercel lineage), built
   with the `frontend-design` skill. Proper light + dark theming via design tokens.
2. **Correctness** — fix the real functional bugs: text-export font/position fidelity, reliable
   typed-signature fonts, self-hosted PDF.js worker, undo/redo, error handling.
3. **SEO / search-friendliness** — a server-rendered marketing landing page at `/` with full
   metadata, OpenGraph/Twitter cards, JSON-LD structured data, robots/sitemap/manifest, and an
   OG image. The editor lives at `/editor`.
4. **Production hardening** — error boundaries, security headers, accessibility, a testable state
   layer with unit tests, and deploy docs for Vercel.

### Non-goals (YAGNI)

- No backend, accounts, persistence, or file uploads to a server — privacy-first is the product.
- No multi-user / collaboration, no cloud storage integrations.
- No PDF form-field editing, redaction, or OCR in this pass (candidate future work).
- No blog/CMS — landing page is static content only (room left to add `/sign-pdf` style pages later).

---

## 2. Architecture

### 2.1 Route structure (the SEO decision)

The editor cannot be server-rendered (PDF.js, canvas, File APIs are browser-only). To be genuinely
search-friendly we split routes:

```
app/
  layout.tsx            # root: fonts, theme provider, base metadata, JSON-LD
  page.tsx              # "/"  — SERVER-RENDERED marketing landing (indexable)
  editor/
    page.tsx            # "/editor" — client-only editor (dynamic import, ssr:false)
  robots.ts             # generated robots.txt
  sitemap.ts            # generated sitemap.xml
  manifest.ts           # PWA manifest
  opengraph-image.tsx   # generated OG image (next/og)
  globals.css           # tokens + Tailwind theme
  not-found.tsx         # branded 404
```

The landing page (`/`) is a React Server Component — zero client JS for its content — so Google sees
a fast, content-rich page. The editor is loaded only on `/editor`.

### 2.2 Editor state layer (testability)

Today all annotation state and logic live inside the `PDFEditor` component, which makes it
untestable. Extract a pure reducer + hook:

```
lib/
  editor/
    types.ts            # TextAnnotation, SignatureAnnotation, Tool, EditorState, Action
    reducer.ts          # pure (state, action) => state — add/update/delete/select, undo/redo
    use-editor.ts       # hook wrapping useReducer + history, keyboard bindings
    export.ts           # PDF export: font mapping, coordinate math, image embedding
    fonts.ts            # UI-font -> pdf-lib StandardFont map; handwriting font registry
    color.ts            # hex -> rgb (handles #rgb, #rrggbb, upper/lowercase)
  pdf/
    worker.ts           # self-hosted PDF.js worker setup
  seo/
    structured-data.ts  # JSON-LD builders (SoftwareApplication, FAQPage)
    site.ts             # canonical site config (name, url, description, keywords)
```

History is an undo/redo stack of `EditorState` snapshots (annotations only — not transient UI like
zoom/selection). Bounded to a sane depth (e.g. 50).

### 2.3 Component structure

```
components/
  editor/
    EditorShell.tsx         # 3-zone layout: tool rail | canvas | inspector
    Toolbar.tsx             # left tool rail (select/text/signature + delete)
    TopBar.tsx              # filename rename, page nav, zoom, undo/redo, export menu
    DocumentCanvas.tsx      # react-pdf rendering + annotation overlay (was PDFViewer)
    AnnotationLayer.tsx     # renders + handles drag/resize (mouse + touch)
    Inspector.tsx           # docked contextual panel (text props / signature props)
    PageThumbnails.tsx      # collapsible page strip
    CommandPalette.tsx      # ⌘K actions
    SignatureModal.tsx      # draw / type / upload (refined, accessible, focus-trapped)
    UploadDropzone.tsx      # redesigned empty state (was PDFUpload)
    ExportMenu.tsx          # download / options
  landing/
    Hero.tsx, FeatureGrid.tsx, HowItWorks.tsx, PrivacyCallout.tsx,
    FAQ.tsx, Footer.tsx, Nav.tsx
  ui/
    Button.tsx, Tooltip.tsx, Toast.tsx (+ provider), Dialog.tsx,
    Logo.tsx (Signet wordmark + mark)
```

`PDFEditor.tsx` becomes a thin composition root using `use-editor` + `EditorShell`.

### 2.4 Data flow

`useEditor` (reducer + history) is the single source of truth for annotations, current tool,
current page, and selection. `DocumentCanvas` renders pages and dispatches placement/drag/resize
actions. `Inspector` and `TopBar` dispatch property/history actions. Export reads the current
annotation set + original `ArrayBuffer` and produces a flattened PDF via `pdf-lib`.

---

## 3. Visual system

- **Theme:** dark-first, with a complete light theme. Tokens as CSS variables in `globals.css`,
  surfaced through Tailwind 4 `@theme`. A `ThemeProvider` (class strategy) with a header toggle;
  respects `prefers-color-scheme` on first load; persists choice to `localStorage`.
- **Palette (dark):** canvas `#0A0A0B`, panel `#141416`, elevated `#1C1C1F`, border `#27272A`,
  text `#FAFAFA` / muted `#A1A1AA`. **Accent** indigo `#6366F1`→`#818CF8` (focus rings, active
  tool, primary action) used sparingly. Semantic: success/emerald, danger/rose, warning/amber.
- **Light palette:** warm-neutral surfaces (`#FFFFFF` / `#FAFAFA` / `#F4F4F5`), same indigo accent.
- **Type:** Geist Sans (UI), **Geist Mono** for technical readouts (zoom %, page x/y, file size,
  shortcuts). Display sizes for landing hero.
- **Surfaces:** 1px borders + faint inner highlight rather than heavy drop shadows; `rounded-lg`.
- **Motion:** 150ms ease standard; subtle spring on tool/panel state; honors
  `prefers-reduced-motion`.
- **Iconography:** Lucide (already a dep), consistent 1.5px stroke.

---

## 4. Editor UX

| Area | Behavior |
| --- | --- |
| **Tool rail (left)** | Select (V), Text (T), Signature (S). Active tool = accent bg + ring. Tooltips show key. Delete appears when a selection exists. |
| **Top bar** | Inline filename rename · `Page x / y` (mono) · zoom out/in with mono `%` readout + fit-width · Undo (⌘Z) / Redo (⌘⇧Z) · Export menu. |
| **Canvas** | Dot-grid backdrop; pages centered with subtle elevation. Text tool shows a blinking caret preview at cursor. Touch + mouse drag/resize. |
| **Inspector (right)** | Docks contextually. Text: content, font family (the 5 mapped fonts), size, color (swatches + picker), alignment. Signature: size, opacity, replace. Empty selection: short hint. |
| **Page thumbnails** | Collapsible left/bottom strip; click to jump; current page highlighted. |
| **Command palette (⌘K)** | Fuzzy actions: switch tool, go to page, add signature, export, toggle theme, zoom. |
| **Signature modal** | Draw / Type / Upload. Type mode uses bundled self-hosted handwriting fonts with live preview. Focus-trapped, ESC closes, restores focus. |
| **Feedback** | Toasts replace all `alert()`. Errors are specific and recoverable. |
| **A11y** | Every control has an accessible name; visible focus rings; modal focus management; keyboard operable; color contrast AA. |
| **Keyboard** | V/T/S tools · Del/Backspace delete selection · ⌘Z/⌘⇧Z undo/redo · ⌘K palette · ESC deselect/close · arrows nudge selection. |

---

## 5. Correctness fixes

1. **Text export fidelity.**
   - Map each UI font to a `pdf-lib` `StandardFont` (Helvetica/Times/Courier families incl.
     bold/italic) via `fonts.ts`. Embed the chosen font and use its metrics.
   - Fix the export Y math so on-screen placement matches output. Account for the annotation box's
     padding/border offset and pdf-lib's bottom-left origin (`y = pageHeight - top - ascent`),
     verified with unit tests on known coordinates.
2. **Typed signatures.** Bundle 4–5 **self-hosted** handwriting web fonts (e.g. Caveat, Dancing
   Script, Great Vibes, Sacramento) instead of OS-only fonts. Render the typed signature to canvas
   with the loaded font (await `document.fonts.ready`) so preview == export across machines. Embed
   via `@pdf-lib/fontkit` where vector text is preferable, else high-DPI PNG.
3. **Self-hosted PDF.js worker.** Ship the worker from the installed `pdfjs-dist` version (matched
   automatically) under `public/` or via bundler asset URL — no hardcoded CDN. Works offline.
4. **Undo/redo.** Reducer-backed history stack (depth 50) covering add/update/delete/move/resize.
5. **Robust input handling.** Validate file type/size with clear toasts; guard corrupt PDFs
   (`PDFDocument.load` try/catch) and unsupported signature images; handle PNG **and** JPG embeds.
6. **Color parsing.** `color.ts` handles `#rgb`, `#rrggbb`, any case; falls back to black.
7. **Cleanup.** Delete dead `pdf-viewer.css`; fix Tailwind-4 deprecations (`bg-opacity-*` →
   `/opacity`, `bg-linear-to-*` confirmed valid in v4); ensure all object URLs are revoked.

---

## 6. SEO & production

- **Landing content** (`/`): hero with value prop + CTA, feature grid, how-it-works (3 steps),
  privacy callout ("your files never leave your device"), FAQ, footer. Keyword-aware copy:
  "edit PDF online", "sign PDF free", "no upload", "browser PDF editor".
- **Metadata:** complete `Metadata` export — title template, description, keywords, canonical,
  `metadataBase`, OpenGraph + Twitter `summary_large_image`.
- **Structured data:** JSON-LD `SoftwareApplication` (free, BrowserApplication) + `FAQPage`.
- **Generated assets:** `robots.ts`, `sitemap.ts`, `manifest.ts` (installable PWA), dynamic
  `opengraph-image.tsx` via `next/og`.
- **Hardening:** root `error.tsx` + editor error boundary; security headers in `next.config.ts`
  (CSP-friendly, `X-Content-Type-Options`, `Referrer-Policy`, frame options); `lang` + favicon set;
  branded `not-found.tsx`.
- **Performance:** code-split editor; lazy-load signature modal/command palette; verify Lighthouse
  ≥ 95 on SEO/Best-Practices/Accessibility for `/` and good perf for `/editor`.

---

## 7. Testing

- **Tooling:** Vitest + @testing-library/react + jsdom.
- **Unit (priority):**
  - `color.ts` — hex parsing variants.
  - `fonts.ts` — UI→StandardFont mapping completeness.
  - `export.ts` — coordinate transform math (screen→PDF) on fixtures.
  - `reducer.ts` — add/update/delete/select, undo/redo invariants, history bounds.
- **Component (light):** UploadDropzone validation, Inspector updates dispatch correct actions,
  SignatureModal mode switching, Toast lifecycle.
- **Manual/verify:** run app, place text + signature, export, diff placement; Lighthouse run.

---

## 8. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Export coordinate math still drifts | Lock it with unit tests on known fixtures before UI polish; verify visually in-app. |
| pdf-lib can't embed arbitrary handwriting as vector | Fall back to high-DPI canvas PNG embed; keep fonts self-hosted so preview matches. |
| Scope is large | Sequence in the plan: state layer + fixes first (substance), then redesign, then landing/SEO, then hardening/tests. Each phase independently shippable. |
| Tailwind 4 + Next 16 are new | Use `frontend-design` skill + verify against installed versions; prefer tokens over magic values. |
| Touch drag conflicts with scroll | Use pointer events with explicit `touch-action` on annotation handles. |

---

## 9. Success criteria

- `/` is server-rendered, content-rich, and passes Lighthouse SEO/Best-Practices/A11y ≥ 95.
- Exported PDFs place text/signatures **exactly** where shown, with correct fonts, on any machine.
- Editor is fully keyboard- and touch-operable; dark **and** light themes are correct.
- Undo/redo, toasts, error boundaries, command palette all functional.
- `npm run build` + `npm run lint` clean; unit tests green.
- The UI reads as a distinctive, premium pro-tool — not generic AI default.
