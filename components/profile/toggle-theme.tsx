import { ChevronRightIcon, MoonIcon, SunIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Uniwind, useUniwind } from 'uniwind'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'

export const THEME_STORAGE_KEY = 'theme'

export type ThemePreference = 'light' | 'dark' | 'system'

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

// Settings row that opens the theme menu
const ToggleTheme = ({ className }: { className?: string }) => {
  // `theme` is the resolved theme ('light' | 'dark'), even when following the system
  const { theme, hasAdaptiveThemes } = useUniwind()
  const current = (hasAdaptiveThemes ? 'system' : theme) as ThemePreference
  const currentLabel = OPTIONS.find(o => o.value === current)?.label

  function setTheme(next: ThemePreference) {
    Uniwind.setTheme(next)
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {})
  }

  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`Appearance: ${currentLabel}`}
          className={cn('min-h-14 flex-row items-center gap-3 active:opacity-70', className)}
        >
          <Icon
            as={theme === 'dark' ? MoonIcon : SunIcon}
            className='text-muted-foreground size-5'
          />
          <Text className='flex-1 font-semibold'>Appearance</Text>
          <Text className='text-muted-foreground text-sm'>{currentLabel}</Text>
          <Icon as={ChevronRightIcon} className='text-muted-foreground size-5' />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' insets={contentInsets}>
        {OPTIONS.map(option => (
          <DropdownMenuItem key={option.value} onPress={() => setTheme(option.value)}>
            <View className='flex-1'>
              <Text className={cn(option.value === current && 'font-semibold')}>
                {option.label}
              </Text>
            </View>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ToggleTheme
