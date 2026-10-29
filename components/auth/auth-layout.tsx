import { router } from 'expo-router'
import { ArrowLeftIcon, HandshakeIcon, type LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

// Shared frame for the signed-out screens: optional back button, a mark,
// title + subtitle, the form, and a footer pinned to the bottom.
export function AuthLayout({
  title,
  subtitle,
  icon,
  showBack = false,
  centered = false,
  footer,
  children,
}: {
  title: string
  subtitle?: string
  /** Shown in a tile above the title; the app mark when omitted */
  icon?: LucideIcon
  showBack?: boolean
  /** Center the content on screen instead of starting near the top, left-aligned */
  centered?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  const insets = useSafeAreaInsets()

  return (
    <View className='bg-background flex-1'>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='interactive'
        bottomOffset={24}
        // Plain styles: the scroll content must fill the screen so the footer sits at the bottom
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
        }}
      >
        <View className='w-full max-w-sm self-center' style={{ flexGrow: 1 }}>
          <View className='h-11 justify-center'>
            {showBack && (
              <Button
                variant='outline'
                size='icon'
                accessibilityLabel='Back'
                className='size-11 self-start'
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
              >
                <Icon as={ArrowLeftIcon} />
              </Button>
            )}
          </View>

          <View
            className={cn(centered ? 'items-center py-8' : 'pt-10')}
            style={{ flexGrow: 1, justifyContent: centered ? 'center' : 'flex-start' }}
          >
            {icon ? (
              <View className='bg-secondary border-border size-16 items-center justify-center rounded-xl border'>
                <Icon as={icon} className='text-primary size-7' />
              </View>
            ) : (
              <View className='bg-primary size-14 items-center justify-center rounded-xl'>
                <Icon as={HandshakeIcon} className='text-primary-foreground size-8' />
              </View>
            )}

            <Text
              role='heading'
              className={cn(
                'mt-7 text-3xl leading-tight font-bold tracking-tight',
                centered && 'text-center'
              )}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                className={cn(
                  'text-muted-foreground mt-2 text-base leading-6',
                  centered && 'text-center'
                )}
              >
                {subtitle}
              </Text>
            ) : null}

            <View className='mt-8 self-stretch'>{children}</View>
          </View>

          {footer ? <View className='flex-row flex-wrap justify-center pt-8'>{footer}</View> : null}
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}
