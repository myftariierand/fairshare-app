import { Image, View } from 'react-native'

import { Text } from '@/components/ui/text'
import { getInitials, getTint } from '@/components/ui/initials-avatar'
import { cn } from '@/lib/utils'

// Group cover thumbnail, or tinted initials when there is no cover
export function GroupAvatar({
  name,
  cover,
  className,
}: {
  name: string
  cover?: string | null
  className?: string
}) {
  if (cover) {
    return (
      <Image
        accessibilityIgnoresInvertColors
        className={cn('size-12 shrink-0 rounded-lg', className)}
        source={{
          uri: `${process.env.EXPO_PUBLIC_IMG_URL}/c_fill,w_120,h_120,g_auto,f_auto,q_auto/${cover}`,
        }}
      />
    )
  }

  const tint = getTint(name)
  return (
    <View
      className={cn('size-12 shrink-0 items-center justify-center rounded-lg', tint.bg, className)}
    >
      <Text className={cn('font-bold', tint.fg)}>{getInitials(name)}</Text>
    </View>
  )
}
