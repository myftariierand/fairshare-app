import { router } from 'expo-router'
import { ArrowLeftIcon, HandshakeIcon, type LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { withUniwind } from 'uniwind'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

// Third-party scroll view, so className needs mapping to style explicitly
const StyledKeyboardAwareScrollView = withUniwind(KeyboardAwareScrollView)

// Shared frame for the signed-out screens: optional back button, a mark,
// title + subtitle, the form, and a footer pinned to the bottom.
export function AuthLayout({
  title,
  subtitle,
  icon,
  showBack = false,
  footer,
  children,
}: {
  title: string
  subtitle?: string
  /** Shown in a tile above the title; the app mark when omitted */
  icon?: LucideIcon
  showBack?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <StyledKeyboardAwareScrollView
      keyboardShouldPersistTaps='handled'
      keyboardDismissMode='interactive'
      bottomOffset={24}
      className='bg-background'
      contentContainerClassName='grow px-6 pt-safe-offset-6 pb-safe-offset-6'
    >
      <View className='w-full max-w-sm grow self-center'>
        {showBack ? (
          <Button
            variant='outline'
            size='icon'
            accessibilityLabel='Back'
            className='mb-8 self-start'
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
          >
            <Icon as={ArrowLeftIcon} />
          </Button>
        ) : (
          <View className='h-12' />
        )}

        {icon ? (
          <View className='bg-secondary border-border size-16 items-center justify-center rounded-xl border'>
            <Icon as={icon} className='text-primary size-7' />
          </View>
        ) : (
          <View className='bg-primary size-14 items-center justify-center rounded-xl'>
            <Icon as={HandshakeIcon} className='text-primary-foreground size-8' />
          </View>
        )}

        <Text role='heading' className='mt-7 text-3xl leading-tight font-bold tracking-tight'>
          {title}
        </Text>
        {subtitle ? (
          <Text className='text-muted-foreground mt-2 text-base leading-6'>{subtitle}</Text>
        ) : null}

        <View className='mt-8'>{children}</View>

        <View className='min-h-8 grow' />
        {footer ? <View className='flex-row flex-wrap justify-center pt-6'>{footer}</View> : null}
      </View>
    </StyledKeyboardAwareScrollView>
  )
}
