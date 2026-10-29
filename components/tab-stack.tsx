import { Stack } from 'expo-router'
import { useCSSVariable } from 'uniwind'

// Stack wrapped around each native tab, so the tab gets a header. iOS uses a native
// large title that collapses on scroll; Android a left-aligned 28px title.
export function TabStack({ title, headerShown = true }: { title: string; headerShown?: boolean }) {
  const [background, foreground] = useCSSVariable([
    '--color-background',
    '--color-foreground',
  ]) as string[]

  return (
    <Stack
      screenOptions={{
        title,
        headerShown,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: background },
        headerTintColor: foreground,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: 'Geist', fontSize: 28, fontWeight: '700' },
        headerLargeTitleEnabled: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: background },
        headerLargeTitleStyle: { fontFamily: 'Geist', fontWeight: '700' },
        contentStyle: { backgroundColor: background },
      }}
    />
  )
}
