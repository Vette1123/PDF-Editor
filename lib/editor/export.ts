import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { hexToRgb01 } from './color'
import { toStandardFont } from './fonts'
import type { Annotation, TextAnnotation, SignatureAnnotation } from './types'

export const ANNOTATION_PADDING = 2 // px, matches AnnotationLayer box padding-top
export const BASELINE_RATIO = 0.8   // baseline offset below glyph top, approx cap height

export function screenToPdfBaseline(args: {
  pageHeight: number
  y: number
  fontSize: number
}): number {
  const { pageHeight, y, fontSize } = args
  return pageHeight - y - ANNOTATION_PADDING - BASELINE_RATIO * fontSize
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; isPng: boolean } {
  const [meta, b64] = dataUrl.split(',')
  const isPng = meta.includes('image/png')
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return { bytes, isPng }
}

export async function exportPdf(
  sourceBytes: ArrayBuffer,
  annotations: Annotation[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sourceBytes)
  doc.registerFontkit(fontkit)
  const pages = doc.getPages()

  const texts = annotations.filter((a): a is TextAnnotation => a.kind === 'text')
  const sigs = annotations.filter((a): a is SignatureAnnotation => a.kind === 'signature')

  for (const t of texts) {
    const page = pages[t.pageNumber - 1]
    if (!page) continue
    const font = await doc.embedFont(toStandardFont(t.fontFamily))
    const { height } = page.getSize()
    const { r, g, b } = hexToRgb01(t.color)
    page.drawText(t.text, {
      x: t.x + ANNOTATION_PADDING,
      y: screenToPdfBaseline({ pageHeight: height, y: t.y, fontSize: t.fontSize }),
      size: t.fontSize,
      font,
      color: rgb(r, g, b),
    })
  }

  for (const s of sigs) {
    const page = pages[s.pageNumber - 1]
    if (!page) continue
    const { height } = page.getSize()
    const { bytes, isPng } = dataUrlToBytes(s.imageData)
    const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    page.drawImage(img, {
      x: s.x,
      y: height - s.y - s.height,
      width: s.width,
      height: s.height,
    })
  }

  return doc.save()
}

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
