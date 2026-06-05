# Signet UX & Account Features — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Executed inline in-session.

**Goal:** Ship UX fixes (cursor, clickable logo, FAQ accordion, branding), motion, IndexedDB PDF persistence with return-to-editor, and DB-backed logged-in features (default signature, signature rename, recent documents, preferences).

**Architecture:** Keep the PDF binary client-only (IndexedDB via `lib/editor/pdf-store.ts`); store only annotation drafts + prefs server-side via Drizzle server actions mirroring `lib/signatures/actions.ts`. New editor concerns isolated in small hooks. Motion via the `motion` package with a `<Reveal>` primitive and `prefers-reduced-motion` gating.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Drizzle + Neon, better-auth, motion, react-pdf, pdf-lib.

---

## Phase A — Quick wins (no DB)

### Task A1: Cursor pointer globally
- Modify `app/globals.css`: base layer rule for `button:not(:disabled), [role=button], summary, label[for]` → `cursor: pointer`; `:disabled` → `not-allowed`.
- Modify `components/ui/Button.tsx`: add `cursor-pointer` + `disabled:cursor-not-allowed` to `base`.
- [ ] Verify in browser later; commit.

### Task A2: Logo clickable in editor + auth
- Modify `components/editor/TopBar.tsx`: wrap `<Logo />` in `Link href="/"` with focus ring + aria-label.
- Modify `components/auth/AuthCard.tsx`: same (read first).
- [ ] Commit.

### Task A3: FAQ accordion, first open + branding
- Rewrite `components/landing/FAQ.tsx` as client motion accordion; first item `defaultOpen`. Keep semantic content in DOM.
- Update `README.md` title/intro + root `package.json` description to "Signet". Confirm `lib/seo/site.ts`.
- [ ] Commit.

## Phase B — Motion

### Task B1: install motion
- `pnpm add motion`. Provide command output.

### Task B2: Reveal primitive + apply
- Create `components/ui/Reveal.tsx` (`whileInView` fade/rise, `prefers-reduced-motion` via `useReducedMotion`).
- Wrap landing sections in `app/page.tsx` / section components.
- Animate `Dialog.tsx` (AnimatePresence scale+fade) and `Toast.tsx` (slide+fade).
- [ ] typecheck; commit.

## Phase C — IndexedDB PDF persistence

### Task C1: pdf-store
- Create `lib/editor/pdf-store.ts`: stores `documents` keyed by docId `{docId,name,bytes,pageCount,updatedAt}` + `meta.currentDocId`. API: `putDoc,getDoc,listDocs,deleteDoc,setCurrent,getCurrent`. Guard `typeof indexedDB`.
- Create `lib/editor/pdf-store.test.ts` (jsdom + fake-indexeddb if available, else test pure helpers). Pure helper `makeDocId`/serialization extracted.

### Task C2: restore-on-mount + persist-on-upload
- New hook `lib/editor/use-pdf-persistence.ts` used by `EditorShell`: on upload persist + setCurrent; on mount with no file, load current → build `File` from bytes, restore filename + annotations.
- Modify `EditorShell.tsx` `handleFile` and add mount restore.
- [ ] typecheck; commit.

### Task C3: auth round-trip return
- `SignOutButton.tsx`: `router.push('/editor')` after signOut.
- Signature modal "Sign in" link: `href="/login?redirect=/editor"`; `LoginForm` honor `?redirect`.
- [ ] commit.

## Phase D — DB schema + actions

### Task D1: schema
- Modify `lib/db/schema.ts`: `signature.isDefault`; new `document`, `userPreference` tables + relations.
- **Hand user the `drizzle-kit push` command** (do not run).

### Task D2: actions
- Extend `lib/signatures/actions.ts`: `renameSignature`, `setDefaultSignature`, list returns isDefault default-first.
- Create `lib/documents/actions.ts`: `listDocuments,upsertDocument,deleteDocument`.
- Create `lib/preferences/actions.ts`: `getPreferences,savePreferences`.
- Unit tests for pure mapping helpers.
- [ ] typecheck; commit.

## Phase E — Wire account features

### Task E1: signature default + rename in Saved tab
- Modify `SignatureModal.tsx`: star toggle (setDefault), inline rename, default-first ordering.

### Task E2: recent documents
- Hook `lib/editor/use-document-autosave.ts`: debounced upsert when signed in.
- `AccountMenu.tsx`: "Recent documents" panel; open → restore bytes from IndexedDB or prompt re-select, then apply annotations.

### Task E3: preferences
- Hook `lib/editor/use-preferences.ts`: load on sign-in, persist on change (theme/defaultFont/defaultZoom). Integrate ThemeProvider + editor defaults.
- [ ] typecheck; tests; commit each.

## Phase F — Verify
- `pnpm typecheck`, `pnpm test`.
- Dev server + chrome-devtools screenshots at 390 / 820 / 1440 widths for landing, editor, signature modal, account panels. Refresh `.verify/`.
- Fix regressions; final commit.
