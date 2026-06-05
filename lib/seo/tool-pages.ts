/**
 * Content for the long-tail SEO landing pages (/sign-pdf, /add-text-to-pdf,
 * /fill-pdf-online). Each page targets one search intent and funnels into the
 * editor. Rendered by `components/landing/ToolLanding.tsx`.
 */

export interface ToolPage {
  slug: string
  /** <title> — the layout appends "· Signet". */
  metaTitle: string
  metaDescription: string
  keywords: string[]
  eyebrow: string
  h1: string
  intro: string
  steps: { title: string; body: string }[]
  faq: { q: string; a: string }[]
}

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: 'sign-pdf',
    metaTitle: 'Sign a PDF Online — Free, No Upload',
    metaDescription:
      'Sign a PDF online for free without uploading it anywhere. Draw, type, or upload your signature — everything happens in your browser. No account, no watermark.',
    keywords: [
      'sign PDF online', 'sign PDF free', 'e-sign PDF', 'PDF signature online',
      'sign PDF without uploading', 'add signature to PDF',
    ],
    eyebrow: 'Sign PDF',
    h1: 'Sign a PDF online — free, private, no upload',
    intro:
      'Add a real signature to any PDF without sending your document to a server. Draw your signature with a mouse or finger, type it in a handwriting font, or upload an image — then place it exactly where it belongs and download the signed PDF. Your file never leaves your device.',
    steps: [
      { title: 'Open your PDF', body: 'Drop the document into the editor — it opens instantly and stays on your machine.' },
      { title: 'Create your signature', body: 'Draw it, type it in one of four handwriting fonts, or upload an image of your signature.' },
      { title: 'Place & download', body: 'Drag your signature into position, resize it, and export the signed PDF — no watermark.' },
    ],
    faq: [
      { q: 'Is it safe to sign a PDF online?', a: 'With Signet, yes — your PDF is never uploaded. All processing happens locally in your browser, so the document never touches a server.' },
      { q: 'Do I need an account to sign a PDF?', a: 'No. Signing and exporting work fully anonymously. An optional free account only adds extras like saved signatures.' },
      { q: 'Is the signature legally binding?', a: 'Signet places a visual signature on the document, which is widely accepted for everyday agreements. For qualified electronic signatures with certificates, use a dedicated e-signature provider.' },
      { q: 'Can I reuse my signature?', a: 'Yes — create a free account and save signatures to reuse across documents and devices. The PDFs themselves still never leave your browser.' },
    ],
  },
  {
    slug: 'add-text-to-pdf',
    metaTitle: 'Add Text to a PDF Online — Free, No Upload',
    metaDescription:
      'Type text onto any PDF for free, directly in your browser. Choose font, size, and color, place text anywhere, and download — without uploading your file to a server.',
    keywords: [
      'add text to PDF', 'write on PDF', 'type on PDF online', 'insert text in PDF',
      'edit PDF text free', 'annotate PDF online',
    ],
    eyebrow: 'Add text',
    h1: 'Add text to a PDF — type anywhere, privately',
    intro:
      'Need to write on a PDF — a name, a date, a note in a margin? Click anywhere on the page, type your text, and style it with custom fonts, sizes, and colors. Everything is processed in your browser, so the document stays on your device from open to export.',
    steps: [
      { title: 'Open your PDF', body: 'Drag and drop the file into the editor. Multi-page documents get thumbnails for quick navigation.' },
      { title: 'Click & type', body: 'Pick the Text tool, click where the text should go, and type. Adjust font, size, and color in the panel.' },
      { title: 'Export', body: 'Download the PDF with your text permanently embedded. The original file is never modified.' },
    ],
    faq: [
      { q: 'Can I edit existing text in the PDF?', a: 'Signet adds new text on top of the document (annotations) — ideal for filling in fields, names, dates, and notes. It does not rewrite text already embedded in the PDF.' },
      { q: 'Which fonts can I use?', a: 'A set of clean UI fonts in any size and color. Text is embedded into the exported PDF exactly as you see it on screen.' },
      { q: 'Is there a watermark or page limit?', a: 'No watermark, no page limit, no paywall. Signet is free and open source.' },
    ],
  },
  {
    slug: 'fill-pdf-online',
    metaTitle: 'Fill Out a PDF Online — Free, No Upload',
    metaDescription:
      'Fill out PDF forms online for free — type into fields, check boxes, add your signature, and download. 100% in your browser; your form never touches a server.',
    keywords: [
      'fill PDF online', 'fill out PDF form free', 'complete PDF form', 'fill and sign PDF',
      'PDF form filler no upload', 'fill PDF without Adobe',
    ],
    eyebrow: 'Fill forms',
    h1: 'Fill out a PDF online — and sign it, privately',
    intro:
      'Applications, contracts, intake forms — fill them out without printing or uploading. Place text into any field, add your signature where required, and download the completed document. Because everything runs client-side, sensitive forms never leave your machine.',
    steps: [
      { title: 'Open the form', body: 'Drop the PDF form into the editor — it renders instantly with pixel-accurate page previews.' },
      { title: 'Fill in your details', body: 'Use the Text tool to type into fields and the Signature tool to sign where needed.' },
      { title: 'Download the completed PDF', body: 'Export with everything embedded in place — ready to email or submit.' },
    ],
    faq: [
      { q: 'Is it safe to fill out sensitive forms online?', a: 'With Signet, the form is processed entirely in your browser and never uploaded — making it suitable for documents with personal or financial details.' },
      { q: 'Does it work with scanned forms?', a: 'Yes. Because you place text freely on the page, it works with scanned and flattened forms that have no interactive fields.' },
      { q: 'Do I need Adobe Acrobat?', a: 'No — Signet runs in any modern browser with nothing to install, and it is completely free.' },
    ],
  },
]
