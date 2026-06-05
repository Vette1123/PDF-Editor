# 📝 Signet

> A privacy-first PDF editor that runs **entirely in your browser** — no uploads, no servers, no account required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### 🚀 [Try Signet live →](https://pdf-editor-beige.vercel.app)

_No sign-up. No upload. Free forever — no trial, paywall, or watermark._

Open a PDF, add text, draw or type a signature, and export the edited document — all processed locally on your device. Your files never leave your browser.

Signet is a free, open-source alternative to online PDF tools like Adobe Acrobat Fill & Sign, DocuSign, Smallpdf, and iLovePDF — with one key difference: there is **no server**. Edit and sign PDFs online without uploading them anywhere.

⭐ **If Signet is useful to you, please [star the repo](https://github.com/Vette1123/PDF-Editor/stargazers)** — it helps others find it.

## ✨ Features

### Editing

- ✍️ **Text annotations** — place text anywhere with customizable font, size, and color
- ✒️ **Signatures, three ways**:
  - **Draw** — sign with mouse or touchscreen
  - **Type** — pick from four elegant handwriting fonts (Caveat, Dancing Script, Great Vibes, Sacramento) with live preview
  - **Upload** — use an existing signature image (PNG, JPG, …)
- 🖱️ **Drag, touch & resize** — move and resize text and signatures with mouse, touch, or keyboard nudging
- 🔍 **Zoom, fit-to-width & page navigation** — page thumbnails and smooth zoom for multi-page documents
- ↩️ **Undo / redo** with a 50-step history
- 💾 **Pixel-accurate export** — download a PDF with all annotations permanently embedded; the original is never modified
- ⌨️ **Command palette & shortcuts** — quick actions (⌘K) plus tool shortcuts

### Experience

- 🔁 **Resume where you left off** — the open PDF is cached in your browser (IndexedDB), so it’s restored automatically after a reload or a sign-in/sign-out round-trip. The bytes never leave your device.
- 🎬 **Animated, polished UI** — tasteful [Motion](https://motion.dev) animations throughout (animated hero, scroll reveals, dialog/toast transitions) with full `prefers-reduced-motion` support
- 📱 **Fully responsive** — adapts from phone to desktop, including the editor chrome
- 🌗 **Light & dark themes**
- 🔒 **100% private** — all PDF processing runs client-side; no file ever touches a server

### Accounts _(optional)_

Sign-in is **never required** — the editor and export work fully anonymously. When the optional auth env vars are configured, signed-in users get extras (and PDF bytes _still_ never leave the browser):

- 🖋️ **Saved signatures** — save signatures to your account, then **set a default**, **rename**, or **delete** them and reuse anywhere
- 🗂️ **Recent documents** — your annotation **drafts** sync to your account so you can pick up a document again (only the annotations + name sync; the PDF file itself stays on your device)
- ⚙️ **Synced preferences** — theme, default text font, and default zoom follow your account across devices
- 👤 **Profile & settings page** (`/account`) — one place to manage signatures, recent documents, and preferences
- 🔑 **Email/password or Google** sign-in (Google optional)

👉 See the [full feature list](FEATURES.md) and the [quick start guide](QUICK_START.md).

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router) + React 19      |
| Language     | [TypeScript 5](https://www.typescriptlang.org)                |
| Styling      | [Tailwind CSS 4](https://tailwindcss.com)                     |
| Animation    | [Motion](https://motion.dev)                                  |
| PDF Export   | [pdf-lib](https://pdf-lib.js.org) — annotation embedding      |
| PDF Render   | [react-pdf](https://github.com/wojtekmaj/react-pdf) + PDF.js  |
| Signatures   | [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) |
| Local storage| IndexedDB — caches the open PDF + annotation drafts on-device |
| Auth _(opt.)_| [Better Auth](https://better-auth.com)                        |
| Database _(opt.)_ | [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) Postgres |
| Forms        | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Icons        | [Lucide React](https://lucide.dev)                            |

## 🚀 Getting Started

**Prerequisites:** Node.js 18.17+ and [pnpm](https://pnpm.io) 9+ (`corepack enable pnpm`).

```bash
# Clone the repo
git clone https://github.com/Vette1123/PDF-Editor.git
cd PDF-Editor

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page is at `/` and the editor at `/editor`.

### Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server                 |
| `pnpm build`        | Create an optimized production build         |
| `pnpm start`        | Serve the production build                   |
| `pnpm test`         | Run the test suite once (Vitest)             |
| `pnpm test:watch`   | Run tests in watch mode                      |
| `pnpm lint`         | Lint with ESLint                             |
| `pnpm typecheck`    | Type-check with `tsc --noEmit`               |
| `pnpm db:generate`  | Generate Drizzle migrations (optional auth)  |
| `pnpm db:push`      | Push schema to the database (optional auth)  |

## 📖 Usage

### Open a PDF

Drag and drop a PDF into the upload area on `/editor`, or click to browse.

### Add Text

1. Choose the **Text tool**
2. Click anywhere on the PDF to place text
3. Edit the text and adjust size and color in the properties panel
4. Switch to the **Select tool** to drag, reposition, or resize

### Add a Signature

1. Open the **Signature** tool
2. **Draw**, **Type**, or **Upload** your signature
3. Insert it, then drag and resize it into position with the Select tool

### Export

Click **Export / Download** — your edited document downloads with all annotations embedded. The original file is never modified.

### Accounts _(optional)_

If the deployment has auth configured, sign up at `/signup` (email/password or Google) to unlock:

- **Save signatures** — in the signature dialog, use _Save to my account_, then manage them under the **Saved** tab or on the **Profile & settings** page (`/account`): star a default, rename, or delete.
- **Recent documents** — your annotation drafts auto-save to your account. Reopen one from `/account` or the editor’s start screen; if the PDF isn’t cached on the current device, you’ll be prompted to re-select the file and your edits are reapplied.
- **Preferences** — set theme, default text font, and default zoom from `/account`; they follow your account.

Reach your account via the avatar menu in the top bar → **Profile & settings**.

## ⚙️ Environment Variables

Signet runs with **zero configuration** — no env vars are required for the core editor and export.

**Required for a production deployment:**

| Variable              | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`| Public canonical site URL used for SEO metadata and the sitemap (e.g. `https://your-domain.com`) |

**Optional — enables account-saved signatures.** Leave these unset and the site works fully with no accounts; auth is gated behind these vars and never required.

| Variable               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `DATABASE_URL`         | Postgres connection string (e.g. [Neon](https://neon.tech)) |
| `BETTER_AUTH_SECRET`   | Random secret (`openssl rand -base64 32`)                |
| `BETTER_AUTH_URL`      | Auth base URL (e.g. `http://localhost:3000`)             |
| `NEXT_PUBLIC_APP_URL`  | Public app URL used by the auth client                   |
| `GOOGLE_CLIENT_ID`     | _(optional)_ Google OAuth client ID — adds "Continue with Google" |
| `GOOGLE_CLIENT_SECRET` | _(optional)_ Google OAuth client secret                  |

Auth is enabled only when **both** `DATABASE_URL` and `BETTER_AUTH_SECRET` are present.

## ▲ Deploy to Vercel

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com/new).
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. _(Optional)_ Add the auth env vars above to enable account-saved signatures.
4. Deploy — Vercel detects Next.js automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🔒 Privacy

All PDF processing happens **locally in your browser**:

- ✅ No file uploads — documents never leave your device
- ✅ No server-side storage of your PDFs — the open file is cached only in your own browser (IndexedDB) so it can be restored after a reload
- ✅ No account required to edit and export

**With an optional account**, the privacy model is unchanged for your files: only your **annotation drafts** (the placed text/signature data + document name), **saved signatures**, and **preferences** are stored — the **PDF bytes are never uploaded**.

## 🤝 Contributing

Contributions are welcome! Feel free to [open an issue](https://github.com/Vette1123/PDF-Editor/issues) or submit a pull request.

## 📄 License

[MIT](LICENSE) — free to use for personal or commercial projects.

## 🙌 Credits

Built by [Mohamed Gado](https://mohamedgado.com).
