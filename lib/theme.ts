import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation'
import { useCSSVariable, useUniwind } from 'uniwind'

// Redesign (beta) theme, registered as an extra theme in metro.config.js
export const BRAND_THEME = 'fairshare'

// The brand theme is a dark palette, so native chrome (status bar, toasts,
// navigation defaults) should treat it like dark.
export function isDarkTheme(theme: string | undefined) {
  return theme === 'dark' || theme === BRAND_THEME
}

// Navigation chrome (headers, tab bar) reads the same tokens as global.css,
// so screens and navigators can't drift apart.
export function useNavTheme(): Theme {
  const { theme } = useUniwind()
  const [background, border, card, notification, primary, text] = useCSSVariable([
    '--color-background',
    '--color-border',
    '--color-card',
    '--color-destructive',
    '--color-primary',
    '--color-foreground',
  ]) as string[]

  const base = isDarkTheme(theme) ? DarkTheme : DefaultTheme

  return {
    ...base,
    colors: { background, border, card, notification, primary, text },
  }
}
