import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  fetchOptions: {
    onError(e: any) {
      console.error('Better Auth error:', e);
    },
  },
})

export const { signIn, signUp, signOut, useSession } = authClient