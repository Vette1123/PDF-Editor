# 📝 Signet

> A privacy-first PDF editor that runs **entirely in your browser** — no uploads, no servers, no account required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Open a PDF, add text, draw or type a signature, and export the edited document — all processed locally on your device. Your files never leave your browser.

## ✨ Features

- ✍️ **Text annotations** — place text anywhere with customizable font, size, and color
- ✒️ **Signatures, three ways**:
  - **Draw** — sign with mouse or touchscreen
  - **Type** — pick from four elegant handwriting fonts (Caveat, Dancing Script, Great Vibes, Sacramento) with live preview
  - **Upload** — use an existing signature image (PNG, JPG, …)
- 🖱️ **Drag, touch & resize** — move and resize text and signatures with mouse or touch
- 🔍 **Zoom & page navigation** — zoom in/out and browse multi-page documents
- 💾 **Export** — download a PDF with all annotations permanently embedded; the original is never modified
- ⌨️ **Command palette & shortcuts** — quick actions (⌘K) plus undo/redo
- 🌗 **Light & dark themes**
- 🔒 **100% private** — everything runs client-side; no file ever touches a server
- 👤 **Optional account-saved signatures** _(coming soon)_ — when configured with the optional auth env vars, signed-in users can save and reuse signatures. The app stays fully usable with no account, and PDFs still never leave the browser.

👉 See the [full feature list](FEATURES.md) and the [quick start guide](QUICK_START.md).

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router) + React 19      |
| Language     | [TypeScript 5](https://www.typescriptlang.org)                |
| Styling      | [Tailwind CSS 4](https://tailwindcss.com)                     |
| PDF Export   | [pdf-lib](https://pdf-lib.js.org) — annotation embedding      |
| PDF Render   | [react-pdf](https://github.com/wojtekmaj/react-pdf) + PDF.js  |
| Signatures   | [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) |
| Icons        | [Lucide React](https://lucide.dev)                            |

## 🚀 Getting Started

**Prerequisites:** Node.js 18.17+

```bash
# Clone the repo
git clone https://github.com/Vette1123/PDF-Editor.git
cd PDF-Editor

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page is at `/` and the editor at `/editor`.

### Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the development server                 |
| `npm run build`    | Create an optimized production build         |
| `npm start`        | Serve the production build                   |
| `npm test`         | Run the test suite once (Vitest)             |
| `npm run test:watch` | Run tests in watch mode                    |
| `npm run lint`     | Lint with ESLint                             |
| `npm run typecheck`| Type-check with `tsc --noEmit`               |

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
- ✅ No server-side storage of your PDFs
- ✅ No account required to edit and export

## 🤝 Contributing

Contributions are welcome! Feel free to [open an issue](https://github.com/Vette1123/PDF-Editor/issues) or submit a pull request.

## 📄 License

[MIT](LICENSE) — free to use for personal or commercial projects.

## 🙌 Credits

Built by [Mohamed Gado](https://mohamedgado.com).
