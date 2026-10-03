// lib/auth-context.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { setAuthFailureHandler } from './api';
import { tokenStorage } from './token-storage';

type Tokens = { accessToken: string; refreshToken?: string };

type AuthContextValue = {
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: (tokens: Tokens) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tokenStorage
      .getAccess()
      .then(setAccessToken)
      .finally(() => setIsLoading(false));
  }, []);

  // When refresh fails for good, flip state and the route guard sends the user to login
  useEffect(() => {
    setAuthFailureHandler(() => setAccessToken(null));
    return () => setAuthFailureHandler(null);
  }, []);

  async function signIn(tokens: Tokens) {
    await tokenStorage.set(tokens);
    setAccessToken(tokens.accessToken);
  }

  async function signOut() {
    await tokenStorage.clear();
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn: !!accessToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
