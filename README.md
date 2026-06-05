# 📝 PDF Editor

> A privacy-first PDF editor that runs **entirely in your browser** — no uploads, no servers, no accounts.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Upload a PDF, add text annotations, draw or type signatures, and export the edited document — all processed locally on your device. Your files never leave your browser.

## ✨ Features

- 📤 **Easy PDF Upload** — Drag and drop or click to upload (up to 50MB)
- ✍️ **Text Annotations** — Add text anywhere with customizable fonts, sizes (10–48px), and colors
- ✒️ **Three Signature Styles**:
  - **Draw** — sign with mouse or touchscreen
  - **Type** — choose from 5 elegant handwriting fonts with live preview
  - **Upload** — use an existing signature image (PNG, JPG, …)
- 🖱️ **Drag & Drop Positioning** — move text and signatures anywhere on the page
- 🔍 **Zoom & Navigate** — zoom 50–200% and browse multi-page documents
- 💾 **Export PDFs** — download with all annotations permanently embedded
- 🔒 **100% Private** — everything runs client-side; no file ever touches a server

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Upload a PDF

Drag and drop a PDF into the upload area, or click to browse.

### Add Text

1. Click the **Text tool** (T icon) in the toolbar
2. Click anywhere on the PDF to place text
3. Double-click text to edit; use the properties panel to change size and color
4. Switch to the **Select tool** to drag and reposition

### Add a Signature

1. Click the **Signature tool** (pen icon)
2. **Draw**, **Type**, or **Upload** your signature
3. Click **Save Signature**, then drag it into position with the Select tool

### Export

Click **Download PDF** — your edited document downloads with all annotations embedded. The original file is never modified.

## 📂 Project Structure

```
pdf-editor/
├── app/
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page with dynamic PDF editor
│   ├── globals.css              # Global styles
│   └── pdf-viewer.css           # PDF viewer styles
├── components/
│   ├── PDFEditor.tsx            # Main editor orchestrator
│   ├── PDFUpload.tsx            # Drag-and-drop file upload
│   ├── PDFViewer.tsx            # PDF rendering with annotations
│   ├── SignatureModal.tsx       # Multi-style signature creator
│   └── TextPropertiesPanel.tsx  # Font size & color controls
└── next.config.ts               # Next.js configuration
```

## 🔒 Privacy

All processing happens **locally in your browser**:

- ✅ No file uploads — documents never leave your device
- ✅ No server-side storage
- ✅ No tracking or accounts

## 🤝 Contributing

Contributions are welcome! Feel free to [open an issue](https://github.com/Vette1123/PDF-Editor/issues) or submit a pull request.

## 📄 License

[MIT](LICENSE) — free to use for personal or commercial projects.
