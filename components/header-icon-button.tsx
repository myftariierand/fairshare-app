import { Link, type Href } from 'expo-router'
import type { LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

// Icon button for a navigation header, with an optional count badge
export function HeaderIconButton({
  href,
  icon,
  label,
  count = 0,
}: {
  href: Href
  icon: LucideIcon
  label: string
  count?: number
}) {
  return (
    <Link asChild href={href}>
      <Button
        size='icon'
        variant='outline'
        accessibilityLabel={count > 0 ? `${label}, ${count} pending` : label}
      >
        <Icon as={icon} />
        {count > 0 && (
          <View className='bg-primary absolute -top-1.5 -right-1.5 h-5 min-w-5 items-center justify-center rounded-full px-1'>
            <Text className='text-primary-foreground text-xs font-semibold'>
              {count > 9 ? '9+' : count}
            </Text>
          </View>
        )}
      </Button>
    </Link>
  )
}
