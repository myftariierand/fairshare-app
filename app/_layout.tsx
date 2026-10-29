import { useEffect } from 'react'
import { Stack, useLocalSearchParams } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useNavTheme } from '@/lib/theme'
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
import { SafeAreaListener } from 'react-native-safe-area-context'

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
      // "New design (beta)" was a separate theme before it became the dark theme
      if (saved === 'fairshare') {
        AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark').catch(() => {})
        saved = 'dark'
      }
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
      <Toaster theme={theme === 'dark' ? 'dark' : 'light'} />
    </GestureHandlerRootView>
  )
}

export default function RootLayout() {
  const { theme } = useUniwind()
  const navTheme = useNavTheme()

  return (
    // Uniwind's *-safe classes (pt-safe, pb-safe-offset-4, …) read insets from here
    <SafeAreaListener
      style={{ flex: 1 }}
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets)
      }}
    >
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider value={navTheme}>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <RootNavigator />
              <PortalHost />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaListener>
  )
}
