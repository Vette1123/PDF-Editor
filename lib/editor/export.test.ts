import { describe, it, expect } from 'vitest'
import { screenToPdfBaseline, ANNOTATION_PADDING, BASELINE_RATIO } from './export'

describe('screenToPdfBaseline', () => {
  it('inverts Y and offsets to baseline', () => {
    const pageHeight = 800
    const y = 100      // top of annotation box in doc px
    const fontSize = 20
    const result = screenToPdfBaseline({ pageHeight, y, fontSize })
    const expected =
      pageHeight - y - ANNOTATION_PADDING - BASELINE_RATIO * fontSize
    expect(result).toBeCloseTo(expected, 5)
  })
  it('top of page maps near page height', () => {
    const r = screenToPdfBaseline({ pageHeight: 800, y: 0, fontSize: 12 })
    expect(r).toBeLessThan(800)
    expect(r).toBeGreaterThan(780)
  })
})
