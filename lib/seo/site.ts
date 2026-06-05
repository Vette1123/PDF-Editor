export const site = {
  name: 'Signet',
  title: 'Signet — Edit & Sign PDFs Privately in Your Browser',
  shortDescription: 'Free, private, in-browser PDF editor.',
  description:
    'Signet is a free, privacy-first PDF editor. Add text, draw or type signatures, and export — entirely in your browser. Your PDFs never leave your device; optionally create a free account to save and reuse signatures.',
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
