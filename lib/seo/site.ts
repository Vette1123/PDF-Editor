/**
 * Validate the configured site URL. `metadataBase: new URL(site.url)` throws a
 * build-breaking `ERR_INVALID_URL` if this is malformed (e.g. set to "1"), so we
 * normalize defensively and fall back to localhost rather than crash the build.
 * next.config.ts already prefers an explicit env / Vercel's domain.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (raw) {
    const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`
    try {
      return new URL(withProtocol).origin
    } catch {
      // fall through to default
    }
  }
  return 'http://localhost:3000'
}

export const site = {
  name: 'Signet',
  title: 'Signet — Edit & Sign PDFs Privately in Your Browser',
  shortDescription: 'Free, private, in-browser PDF editor.',
  description:
    'Signet is a free, privacy-first PDF editor. Add text, draw or type signatures, and export — entirely in your browser. Your PDFs never leave your device; optionally create a free account to save and reuse signatures.',
  url: resolveSiteUrl(),
  tagline: 'Edit & sign PDFs — privately, in your browser.',
  keywords: [
    'PDF editor', 'edit PDF online', 'sign PDF free', 'add text to PDF',
    'PDF signature', 'browser PDF editor', 'no upload PDF editor', 'private PDF editor',
  ],
  author: 'Mohamed Gado',
  authorUrl: 'https://mohamedgado.com',
  repo: 'https://github.com/Vette1123/PDF-Editor',
} as const
