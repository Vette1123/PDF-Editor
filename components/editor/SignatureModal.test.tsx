import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignatureModal } from './SignatureModal'

describe('SignatureModal', () => {
  it('switches to Type mode and shows the name input', async () => {
    render(<SignatureModal open onClose={vi.fn()} onSave={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: /type/i }))
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
  })
})
