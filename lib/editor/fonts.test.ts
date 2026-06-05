import { describe, it, expect } from 'vitest'
import { StandardFonts } from 'pdf-lib'
import { toStandardFont, UI_FONTS } from './fonts'

describe('font mapping', () => {
  it('maps every UI font to a pdf-lib StandardFont', () => {
    for (const f of UI_FONTS) {
      expect(Object.values(StandardFonts)).toContain(toStandardFont(f.value))
    }
  })
  it('defaults unknown to Helvetica', () => {
    // @ts-expect-error testing fallback
    expect(toStandardFont('Nope')).toBe(StandardFonts.Helvetica)
  })
})
