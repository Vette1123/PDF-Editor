import { describe, it, expect } from 'vitest'
import { softwareAppLd, faqLd } from './structured-data'

describe('structured data', () => {
  it('builds SoftwareApplication LD with required fields', () => {
    const ld = softwareAppLd()
    expect(ld['@type']).toBe('SoftwareApplication')
    expect(ld.offers.price).toBe('0')
  })
  it('builds FAQPage LD from Q/A pairs', () => {
    const ld = faqLd([{ q: 'Is it free?', a: 'Yes.' }])
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe('Yes.')
  })
})
