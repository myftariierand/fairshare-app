import { Platform } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { PlusIcon } from 'lucide-react-native'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

// Approximate native tab bar heights above the bottom safe area: iOS 26's floating
// glass bar and Android's Material bottom navigation
const TAB_BAR_HEIGHT = Platform.select({ ios: 62, default: 80 })

// Accent-colored "Add expense" button floating above the native tab bar. Native tabs
// can't color a single tab, so this replaces a plain Add tab. It slides in and out
// as it's mounted and unmounted on tab changes.
export function FloatingAddButton() {
  const insets = useSafeAreaInsets()

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(160)}
      style={{ position: 'absolute', right: 16, bottom: insets.bottom + TAB_BAR_HEIGHT + 12 }}
    >
      <Button
        size='lg'
        accessibilityLabel='Add expense'
        className='h-14 rounded-2xl pr-5 pl-4 shadow-lg shadow-black/30'
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push('/new-expense')
        }}
      >
        <Icon as={PlusIcon} className='size-5' />
        <Text>Add expense</Text>
      </Button>
    </Animated.View>
  )
}
