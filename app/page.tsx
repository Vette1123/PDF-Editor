import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PrivacyCallout } from '@/components/landing/PrivacyCallout'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { FAQ_ITEMS } from '@/components/landing/faq-data'
import { softwareAppLd, faqLd } from '@/lib/seo/structured-data'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd()) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(FAQ_ITEMS)) }} />
      <Nav />
      <main>
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <PrivacyCallout />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
