import type { MetadataRoute } from 'next'
import { site } from '@/lib/seo/site'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/editor`, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
