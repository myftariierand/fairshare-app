import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation'
import { useCSSVariable, useUniwind } from 'uniwind'

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

  const base = theme === 'dark' ? DarkTheme : DefaultTheme

  return {
    ...base,
    colors: { background, border, card, notification, primary, text },
  }
}
