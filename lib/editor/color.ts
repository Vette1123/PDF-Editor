export interface Rgb01 { r: number; g: number; b: number }

export function hexToRgb01(input: string): Rgb01 {
  const black: Rgb01 = { r: 0, g: 0, b: 0 }
  let hex = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(hex)) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-f]{6}$/.test(hex)) return black
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  }
}
