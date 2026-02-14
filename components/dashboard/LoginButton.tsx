'use client'

import { signIn } from 'next-auth/react'

export function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
      className="btn-primary px-8 py-3 rounded-2xl"
    >
      Entrar com Discord
    </button>
  )
}
