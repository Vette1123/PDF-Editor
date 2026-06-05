import { describe, it, expect } from 'vitest'
import { hexToRgb01 } from './color'

describe('hexToRgb01', () => {
  it('parses #rrggbb', () => {
    expect(hexToRgb01('#ff0000')).toEqual({ r: 1, g: 0, b: 0 })
  })
  it('parses without hash and uppercase', () => {
    expect(hexToRgb01('00FF00')).toEqual({ r: 0, g: 1, b: 0 })
  })
  it('parses shorthand #rgb', () => {
    expect(hexToRgb01('#00f')).toEqual({ r: 0, g: 0, b: 1 })
  })
  it('falls back to black on garbage', () => {
    expect(hexToRgb01('not-a-color')).toEqual({ r: 0, g: 0, b: 0 })
  })
})
