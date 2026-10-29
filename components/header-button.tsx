import type { LucideIcon } from 'lucide-react-native'

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
