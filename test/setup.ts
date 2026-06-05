import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom has no real 2D canvas context (that normally comes from the optional
// native `canvas` package, which we deliberately don't build). Stub a no-op 2D
// context + toDataURL so components that touch canvas (signature pad / typed
// signature preview) can mount in unit tests. The real browser uses canvas
// natively — this only affects the jsdom test environment.
const context2dStub = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === 'measureText') return () => ({ width: 0 })
      if (prop === 'getImageData')
        return () => ({ data: new Uint8ClampedArray(4) })
      if (prop === 'createLinearGradient' || prop === 'createPattern')
        return () => context2dStub
      return () => undefined
    },
    set: () => true,
  }
)

HTMLCanvasElement.prototype.getContext = vi.fn(
  () => context2dStub
) as unknown as HTMLCanvasElement['getContext']
HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => 'data:image/png;base64,'
) as unknown as HTMLCanvasElement['toDataURL']
