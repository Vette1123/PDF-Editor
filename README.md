# PDF Editor

A modern, feature-rich PDF editor built with Next.js 15, React, and TypeScript. Upload PDFs, add text annotations, draw or type signatures, and export your edited documents.

## Features

- 📤 **Easy PDF Upload** - Drag and drop or click to upload PDF files
- ✍️ **Text Annotations** - Add and edit text anywhere on your PDF with customizable fonts and colors
- ✒️ **Multiple Signature Styles**:
  - Draw signatures with mouse or touchscreen
  - Type signatures with multiple elegant font styles
  - Upload signature images
- 🎨 **Intuitive Interface** - Clean, modern UI with easy-to-use tools
- 🔍 **Zoom & Navigate** - Zoom in/out and navigate through multi-page documents
- 🖱️ **Drag & Drop** - Move text and signatures anywhere on the page
- 💾 **Export PDFs** - Download your edited PDFs with all annotations preserved

## Technologies

- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern utility-first styling
- **pdf-lib** - PDF manipulation and export
- **react-pdf** - PDF rendering with pdfjs-dist
- **react-signature-canvas** - Signature drawing canvas
- **Lucide React** - Beautiful, consistent icons

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Uploading a PDF

1. Drag and drop a PDF file into the upload area, or click to browse and select a file

### Adding Text

1. Click the **Text tool** (T icon) in the toolbar
2. Click anywhere on the PDF where you want to add text
3. Use the **Select tool** to drag and reposition text
4. Double-click text to edit it

### Adding Signatures

1. Click the **Signature tool** (pen icon) in the toolbar
2. Choose from three signature methods:
   - **Draw**: Use your mouse or touchscreen to draw your signature
   - **Type**: Enter your name and choose from elegant font styles
   - **Upload**: Upload an existing signature image
3. Click "Save Signature" to add it to your PDF
4. Use the **Select tool** to reposition and resize signatures

### Navigating & Viewing

- Use the page navigation controls to move between pages
- Use zoom controls to adjust the view size
- Select tool allows you to click and drag annotations

### Exporting

- Click **Download PDF** to save your edited document with all annotations

## Project Structure

```
pdf-editor/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page with dynamic PDF editor
│   └── globals.css         # Global styles
├── components/
│   ├── PDFEditor.tsx       # Main editor orchestrator
│   ├── PDFUpload.tsx       # Drag-and-drop file upload
│   ├── PDFViewer.tsx       # PDF rendering with annotations
│   └── SignatureModal.tsx  # Multi-style signature creator
└── next.config.ts          # Next.js configuration
```

## License

MIT License - free to use for personal or commercial projects.
