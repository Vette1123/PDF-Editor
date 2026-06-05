'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from '@/lib/auth-client'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { GoogleButton } from './GoogleButton'

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await signIn.email({ email, password, callbackURL: '/editor' })
    if (error) {
      toast({ kind: 'error', message: error.message ?? 'Could not sign in. Please try again.' })
      return
    }
    router.push('/editor')
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <GoogleButton label="Continue with Google" />
    </form>
  )
}
