// lib/auth-context.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

import { setAuthFailureHandler } from './api'
import { tokenStorage } from './token-storage'

import { getProfile, type User } from '@/lib/auth'
import { Profile } from '@/types/common'

type Tokens = { accessToken: string; refreshToken?: string }

type AuthContextValue = {
  isLoading: boolean
  isLoggedIn: boolean
  setTokens: (tokens: Tokens) => Promise<void>
  signOut: () => Promise<void>
  user: Profile | null
  setUser: React.Dispatch<React.SetStateAction<Profile | null>>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    tokenStorage
      .getAccess()
      .then(async token => {
        setAccessToken(token)
        if (token) {
          const user = await getProfile()
          setUser(user as Profile)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  // When refresh fails for good, flip state and the route guard sends the user to login
  useEffect(() => {
    setAuthFailureHandler(() => setAccessToken(null))
    return () => setAuthFailureHandler(null)
  }, [])

  async function setTokens(tokens: Tokens) {
    await tokenStorage.set(tokens)
    setAccessToken(tokens.accessToken)
  }

  async function signOut() {
    await GoogleSignin.signOut()
    await tokenStorage.clear()
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ isLoading, isLoggedIn: !!accessToken, user, setTokens, signOut, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function useAuthUser(): Profile {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    throw new Error('useAuthUser must be used when a user is authenticated')
  }

  return user
}
