import { ImageResponse } from 'next/og'
import { site } from '@/lib/seo/site'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function Og() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 80, background: '#0a0a0b', color: '#fafafa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, border: '4px solid #6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: '#6366f1' }} />
          </div>
          <div style={{ fontSize: 64, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ fontSize: 34, color: '#a1a1aa', marginTop: 24 }}>{site.tagline}</div>
        <div style={{ fontSize: 22, color: '#71717a', marginTop: 'auto' }}>
          {site.authorUrl.replace('https://', '')}
        </div>
      </div>
    ),
    { ...size },
  )
}
