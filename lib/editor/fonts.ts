import { StandardFonts } from 'pdf-lib'
import type { FontFamily } from './types'

export const UI_FONTS: { value: FontFamily; label: string; css: string }[] = [
  { value: 'Helvetica', label: 'Sans', css: 'Helvetica, Arial, sans-serif' },
  { value: 'Helvetica-Bold', label: 'Sans Bold', css: 'Helvetica, Arial, sans-serif' },
  { value: 'Times-Roman', label: 'Serif', css: '"Times New Roman", Times, serif' },
  { value: 'Courier', label: 'Mono', css: '"Courier New", Courier, monospace' },
]

export function toStandardFont(family: FontFamily): StandardFonts {
  switch (family) {
    case 'Helvetica': return StandardFonts.Helvetica
    case 'Helvetica-Bold': return StandardFonts.HelveticaBold
    case 'Times-Roman': return StandardFonts.TimesRoman
    case 'Courier': return StandardFonts.Courier
    default: return StandardFonts.Helvetica
  }
}

export function fontWeight(family: FontFamily): 'normal' | 'bold' {
  return family === 'Helvetica-Bold' ? 'bold' : 'normal'
}
