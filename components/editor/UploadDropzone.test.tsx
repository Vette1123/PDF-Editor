import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '@/components/ui/Toast'
import { UploadDropzone } from './UploadDropzone'

function setup(onFile = vi.fn()) {
  render(
    <ToastProvider>
      <UploadDropzone onFile={onFile} />
    </ToastProvider>,
  )
  return onFile
}

describe('UploadDropzone', () => {
  it('accepts a PDF via the hidden input', async () => {
    const onFile = setup()
    const file = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/upload pdf/i) as HTMLInputElement
    await userEvent.upload(input, file)
    expect(onFile).toHaveBeenCalledWith(file)
  })
  it('rejects a non-PDF', async () => {
    const onFile = setup()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload pdf/i) as HTMLInputElement
    await userEvent.upload(input, file)
    expect(onFile).not.toHaveBeenCalled()
  })
})
