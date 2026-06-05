import { pdfjs } from 'react-pdf'

// Self-host the worker matching the installed pdfjs-dist version.
// Vercel/Next bundles this URL; works offline and survives version bumps.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()
