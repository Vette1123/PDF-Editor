'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUp } from '@/lib/auth-client'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { GoogleButton } from './GoogleButton'

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await signUp.email({ name, email, password, callbackURL: '/editor' })
    if (error) {
      toast({ kind: 'error', message: error.message ?? 'Could not create your account. Please try again.' })
      return
    }
    // Email verification is not required, so the user is signed in automatically.
    toast({ kind: 'success', message: 'Account created. Welcome to Signet.' })
    router.push('/editor')
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Name"
        type="text"
        autoComplete="name"
        placeholder="Jane Appleseed"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <GoogleButton label="Sign up with Google" />
    </form>
  )
}
