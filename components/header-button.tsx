import { router } from 'expo-router'
import { ArrowLeftIcon, type LucideIcon } from 'lucide-react-native'
import { useCSSVariable } from 'uniwind'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

// Outlined icon button for a stack header (back, close)
export function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
}) {
  return (
    <Button variant='outline' size='icon' accessibilityLabel={label} onPress={onPress}>
      <Icon as={icon} />
    </Button>
  )
}

// Stack screen options that put `element` on the header's left. iOS 26 puts header
// buttons on a shared glass pill; the outlined button has its own outline instead.
export function headerLeftOptions(element: React.ReactElement) {
  return {
    headerBackVisible: false,
    headerLeft: () => element,
    unstable_headerLeftItems: () => [
      { type: 'custom' as const, element, hidesSharedBackground: true },
    ],
  }
}

// Same as headerLeftOptions, for the right side of the header
export function headerRightOptions(element: React.ReactElement) {
  return {
    headerRight: () => element,
    unstable_headerRightItems: () => [
      { type: 'custom' as const, element, hidesSharedBackground: true },
    ],
  }
}

// Header used across stack screens: centered title on the screen background,
// no divider, and an outlined button on the left (back unless `left` is given)
export function useCenteredHeader(title: string, left?: React.ReactElement) {
  const background = useCSSVariable('--color-background') as string
  return {
    title,
    headerTitleAlign: 'center' as const,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: background },
    headerTitleStyle: { fontFamily: 'Geist', fontWeight: '600' as const },
    ...headerLeftOptions(
      left ?? <HeaderButton icon={ArrowLeftIcon} label='Back' onPress={() => router.back()} />
    ),
  }
}
