import type { Metadata } from 'next'
import { Geist, Geist_Mono, Caveat, Dancing_Script, Great_Vibes, Sacramento } from 'next/font/google'
import { ThemeProvider, themeInitScript } from '@/components/ui/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { site } from '@/lib/seo/site'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const caveat = Caveat({ variable: '--font-caveat', subsets: ['latin'] })
const dancing = Dancing_Script({ variable: '--font-dancing', subsets: ['latin'] })
const greatVibes = Great_Vibes({ variable: '--font-great-vibes', weight: '400', subsets: ['latin'] })
const sacramento = Sacramento({ variable: '--font-sacramento', weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.author, url: site.authorUrl }],
  creator: site.author,
  publisher: site.author,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', url: site.url, siteName: site.name,
    title: site.title, description: site.description,
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
}

const fontVars = [geistSans, geistMono, caveat, dancing, greatVibes, sacramento]
  .map((f) => f.variable).join(' ')

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${fontVars} antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
