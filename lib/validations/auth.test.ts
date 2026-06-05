import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema } from './auth'

describe('auth validations', () => {
  it('rejects short passwords on signup', () => {
    expect(signupSchema.safeParse({ name: 'Jo', email: 'a@b.com', password: 'short' }).success).toBe(false)
  })
  it('accepts a valid signup', () => {
    expect(signupSchema.safeParse({ name: 'Jane', email: 'a@b.com', password: 'longenough' }).success).toBe(true)
  })
  it('requires a password on login', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})
