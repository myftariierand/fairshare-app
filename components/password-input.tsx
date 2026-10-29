import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Input with a show/hide toggle; everything else passes through to Input
export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <View className='justify-center'>
      <Input
        secureTextEntry={!visible}
        autoCapitalize='none'
        autoCorrect={false}
        className={cn('pr-12', className)}
        {...props}
      />
      <Pressable
        onPress={() => setVisible(v => !v)}
        accessibilityRole='button'
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        hitSlop={4}
        className='absolute right-1 size-11 items-center justify-center rounded-md active:opacity-60'
      >
        <Icon as={visible ? EyeOffIcon : EyeIcon} className='text-muted-foreground size-5' />
      </Pressable>
    </View>
  )
}
