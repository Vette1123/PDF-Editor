'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onSignOut = async () => {
    setPending(true)
    await signOut()
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSignOut}
      disabled={pending}
      aria-label="Sign out"
      className="w-full justify-start"
    >
      <LogOut size={16} />
      Sign out
    </Button>
  )
}
