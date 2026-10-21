import { MoonIcon, SunIcon } from 'lucide-react-native'
import { Uniwind, useUniwind } from 'uniwind'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const THEME_STORAGE_KEY = 'theme'

export type ThemePreference = 'light' | 'dark' | 'system'

const ToggleTheme = () => {
  // `theme` is the resolved theme ('light' | 'dark'), even when following the system
  const { theme } = useUniwind()

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
        <Button variant='outline' size='icon' accessibilityLabel='Toggle theme'>
          <Icon as={theme === 'dark' ? MoonIcon : SunIcon} className='size-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' insets={contentInsets}>
        <DropdownMenuItem onPress={() => setTheme('light')}>
          <Text>Light</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => setTheme('dark')}>
          <Text>Dark</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => setTheme('system')}>
          <Text>System</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ToggleTheme
