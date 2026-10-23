import { useEffect } from 'react'
import { Stack, useLocalSearchParams } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { NAV_THEME } from '@/lib/theme'
import { ThemeProvider } from 'expo-router/react-navigation'
import { PortalHost } from '@rn-primitives/portal'
import { StatusBar } from 'expo-status-bar'
import { useUniwind, Uniwind } from 'uniwind'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { THEME_STORAGE_KEY, type ThemePreference } from '@/components/profile/toggle-theme'
import { KeyboardProvider } from 'react-native-keyboard-controller'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
})

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { theme } = useUniwind()
  const { isLoading, isLoggedIn, user } = useAuth()
  const { groupId } = useLocalSearchParams<{ groupId: string }>()

  // inside your RootLayout component
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved) Uniwind.setTheme(saved as ThemePreference)
    })
  }, [])

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync()
  }, [isLoading])

  if (isLoading) return null

  const isAuthed = isLoggedIn && !!user

  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthed && user.emailVerified}>
          <Stack.Screen name='(private)' />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthed}>
          <Stack.Screen name='(public)' />
        </Stack.Protected>
        <Stack.Protected guard={isAuthed && !user.emailVerified}>
          <Stack.Screen name='verify-email' />
        </Stack.Protected>
      </Stack>
      <Toaster theme={theme} />
    </GestureHandlerRootView>
  )
}

export default function RootLayout() {
  const { theme } = useUniwind()

  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
            <PortalHost />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  )
}
