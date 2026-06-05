import type { MetadataRoute } from 'next'
import { site } from '@/lib/seo/site'
import { TOOL_PAGES } from '@/lib/seo/tool-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/editor`, changeFrequency: 'monthly', priority: 0.8 },
    ...TOOL_PAGES.map((p) => ({
      url: `${site.url}/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
