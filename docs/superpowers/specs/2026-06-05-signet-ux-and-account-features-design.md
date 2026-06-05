# Signet — UX polish & logged-in account features

**Date:** 2026-06-05
**Branch:** `feat/signet-production`
**Status:** Approved

## Goal

A batch of UX fixes plus three new logged-in capabilities for the Signet PDF
signing app, all while preserving the core privacy promise: **the PDF bytes
never leave the user's device.** Annotation drafts and preferences may be stored
server-side (they are not the document content); the PDF binary is stored only
in the browser (IndexedDB).

## Scope

### 1. Cross-cutting UX fixes

- **Cursor pointer on CTAs.** Tailwind v4 removed the default `cursor: pointer`
  on `<button>`. Restore it globally in `app/globals.css`:
  `button:not(:disabled), [role="button"], summary, label[for] { cursor: pointer }`
  and `:disabled { cursor: not-allowed }`. Add `cursor-pointer` to the `Button`
  base class as belt-and-suspenders.
- **Logo clickable.** Landing `Nav` already wraps `Logo` in `Link href="/"`.
  Add the same to the editor `TopBar` logo and the auth pages (`AuthCard`).
  `Logo` stays presentational.
- **FAQ accordion.** Landing uses native `<details>` (no shadcn in the repo).
  Convert `FAQ` to a small motion-animated accordion with the **first item open
  by default**; content remains server-rendered for SEO.
- **Branding.** Reflect the "Signet" name in `README.md` and root
  `package.json` `description`. Confirm `lib/seo/site.ts` already says Signet.

### 2. Motion (tasteful micro-interactions)

- Install `motion`; import from `motion/react`.
- Reusable `<Reveal>` component: scroll-triggered fade/rise via `whileInView`,
  used on landing sections (Hero, FeatureGrid, HowItWorks, FAQ, PrivacyCallout).
- Animate `Dialog` (scale + fade via `AnimatePresence`), `Toast` (slide + fade),
  and the FAQ accordion height.
- All motion gated on `prefers-reduced-motion` (no motion when reduced).

### 3. Preserve uploaded PDF + return-to-editor

- New `lib/editor/pdf-store.ts`: dependency-free IndexedDB wrapper.
  - Object store `documents` keyed by `docId`: `{ docId, name, bytes (ArrayBuffer), pageCount, updatedAt }`.
  - A `meta` store holding `currentDocId`.
  - API: `putDoc`, `getDoc`, `listDocs`, `deleteDoc`, `setCurrent`, `getCurrent`.
- `EditorShell`:
  - On upload: assign a `docId` (uuid), persist bytes + name, set current.
  - On mount with no in-memory file: auto-restore the current doc (bytes →
    `File`/`ArrayBuffer`, filename, and annotations from the saved draft).
- Auth round-trip: `LoginForm` already redirects to `/editor`. Make the
  signature-modal "Sign in" link carry `?redirect=/editor`, and have
  `SignOutButton` route to `/editor`. Combined with auto-restore, the user lands
  back on their document after both sign-in and sign-out.

### 4. Account features (DB-backed, logged-in only)

Schema additions in `lib/db/schema.ts` (applied via `drizzle-kit push`, run by
the user with their DB password):

- `signature`: add `isDefault boolean default false notNull`.
- New `document` table: `{ id (pk), userId (fk), docId (text), name, annotations (text/json), pageCount (int), createdAt, updatedAt }`, unique on `(userId, docId)`, index on `userId`. **Stores annotation drafts + name only — never PDF bytes.**
- New `userPreference` table: `{ userId (pk, fk), theme, defaultFont, defaultZoom, updatedAt }`.

Server actions:

- `lib/signatures/actions.ts` (extend): `renameSignature(id, name)`,
  `setDefaultSignature(id)` (clears others for the user in a txn). `listSignatures`
  returns `isDefault` and orders default first.
- New `lib/documents/actions.ts`: `listDocuments()`, `upsertDocument({docId, name, annotations, pageCount})`, `deleteDocument(docId)`.
- New `lib/preferences/actions.ts`: `getPreferences()`, `savePreferences(partial)`.

All actions re-check the session and scope every query by `session.user.id`;
they no-op/return safe values when `!session || !db` (matching existing pattern).

UX wiring:

- **Default signature** — star toggle in the Saved tab; default sorts first;
  one-click insert. Toolbar signature action can pre-fill from the default.
- **Signature rename/manage** — inline pencil-rename in the Saved tab.
- **Recent documents** — when signed in, debounced (`~1.5s`) auto-save of
  `{docId, name, annotations, pageCount}` to the DB on annotation changes. A
  "Recent documents" view in `AccountMenu` lists them; opening one restores PDF
  bytes from IndexedDB if present locally, otherwise prompts the user to
  re-select the file and then re-applies the saved annotations.
- **Preferences** — theme + default font + default zoom load on sign-in and
  persist (debounced) on change. Theme integrates with the existing
  `ThemeProvider`; editor reads default font/zoom on document open.

### 5. Verification ("responsive check again")

- `pnpm typecheck` and `pnpm test` must pass; add unit tests for the new pure
  logic (pdf-store key/serialization helpers, preferences merge, default-sig
  ordering, document upsert mapping) following existing colocated `*.test.ts`.
- Launch dev server; use chrome-devtools to screenshot mobile / tablet / desktop
  for landing + editor + signature modal + new account views. Refresh `.verify/`
  artifacts. Fix regressions.

## Architecture / boundaries

- **`lib/editor/pdf-store.ts`** — sole owner of IndexedDB. Pure-ish module with a
  narrow promise-based API; no React. Unit-testable serialization helpers split
  out where possible.
- **`lib/documents/actions.ts`, `lib/preferences/actions.ts`** — server actions,
  same shape and guards as `lib/signatures/actions.ts`.
- **`components/ui/Reveal.tsx`** — single motion primitive reused across landing.
- **`components/landing/FAQ.tsx`** — becomes a client accordion; first item open.
- **`components/auth/AccountMenu.tsx`** — gains entries: Recent documents,
  Manage signatures (links into editor views), reflecting new features.
- **`EditorShell`** — orchestrates restore-on-mount, autosave, preferences,
  default signature; keep new logic in small hooks (`use-pdf-persistence`,
  `use-document-autosave`, `use-preferences`) so the shell stays readable.

## Non-goals / YAGNI

- No server-side storage of PDF bytes (privacy promise).
- No cross-device file sync (only annotation drafts + prefs sync).
- No collaboration/sharing, no multi-tenant features.
- No migration framework beyond `drizzle-kit push`.

## Risks

- **DB push must be run by the user** (password changed). The agent will not run
  `drizzle-kit push`; it will provide the exact command.
- IndexedDB unavailable (private mode / SSR): all access guarded; editor falls
  back to in-memory state, restore silently no-ops.
- `react-pdf` needs a `File`/URL; restoring from `ArrayBuffer` requires building
  a `File`/`Blob` — verify `DocumentCanvas`/`PageThumbnails` accept it.
