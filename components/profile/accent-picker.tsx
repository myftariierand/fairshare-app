import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { CheckIcon, ChevronRightIcon, PaletteIcon } from 'lucide-react-native'
import { useUniwind } from 'uniwind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ACCENTS, getAccent, getCurrentAccent, setAccent, type AccentId } from '@/lib/accent'
import { cn } from '@/lib/utils'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Settings row that opens a menu of preset accent colors
export default function AccentPicker({ className }: { className?: string }) {
  const { theme } = useUniwind()
  const [current, setCurrent] = useState<AccentId>(getCurrentAccent())
  const shade = (id: AccentId) => getAccent(id)[theme === 'dark' ? 'dark' : 'light'].primary

  const insets = useSafeAreaInsets()
  const contentInsets = { top: insets.top, bottom: insets.bottom, left: 12, right: 12 }

  const pick = (id: AccentId) => {
    setCurrent(id)
    setAccent(id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`Accent color: ${getAccent(current).label}`}
          className={cn('min-h-14 flex-row items-center gap-3 active:opacity-70', className)}
        >
          <Icon as={PaletteIcon} className='text-muted-foreground size-5' />
          <Text className='flex-1 font-semibold'>Accent color</Text>
          <View className='flex-row items-center gap-2'>
            <View
              className='border-border size-4 rounded-full border'
              style={{ backgroundColor: shade(current) }}
            />
            <Text className='text-muted-foreground text-sm'>{getAccent(current).label}</Text>
          </View>
          <Icon as={ChevronRightIcon} className='text-muted-foreground size-5' />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' insets={contentInsets}>
        {ACCENTS.map(accent => (
          <DropdownMenuItem key={accent.id} onPress={() => pick(accent.id)}>
            <View
              className='border-border size-5 rounded-full border'
              style={{ backgroundColor: shade(accent.id) }}
            />
            <Text className={cn('flex-1', accent.id === current && 'font-semibold')}>
              {accent.label}
            </Text>
            {accent.id === current && <Icon as={CheckIcon} className='size-4' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
