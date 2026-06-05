'use client'
import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const fieldBase =
  'w-full rounded-lg border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--text)] ' +
  'outline-none transition-[border-color,box-shadow] placeholder:text-[var(--text-muted)] ' +
  'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Validation error message; rendered below and wired via aria-describedby. */
  error?: string
}

/** Labeled text input with token styling, focus ring, and error messaging. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId
    const errorId = `${inputId}-error`
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            fieldBase,
            error ? 'border-[var(--danger)]' : 'border-[var(--border-strong)]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export type PasswordInputProps = InputProps

/** Password input with a show/hide toggle button. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId
    const errorId = `${inputId}-error`
    const [visible, setVisible] = useState(false)
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={[
              fieldBase,
              'pr-11',
              error ? 'border-[var(--danger)]' : 'border-[var(--border-strong)]',
              className,
            ].join(' ')}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
