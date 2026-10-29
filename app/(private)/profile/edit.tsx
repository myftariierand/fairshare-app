import { Stack, router } from 'expo-router'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { ArrowLeftIcon } from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { HeaderButton, headerLeftOptions } from '@/components/header-button'
import UpdateProfileForm from '@/components/profile/update-profile-form'
import ChangePasswordForm from '@/components/profile/change-password-form'

export default function EditProfileScreen() {
  const user = useAuthUser()
  const insets = useSafeAreaInsets()
  const background = useCSSVariable('--color-background') as string

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: background },
          headerTitleStyle: { fontFamily: 'Geist', fontWeight: '600' },
          ...headerLeftOptions(
            <HeaderButton icon={ArrowLeftIcon} label='Back' onPress={() => router.back()} />
          ),
        }}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        bottomOffset={24}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 20 }}
      >
        <View className='items-center py-2'>
          <InitialsAvatar name={user.name} className='size-21' textClassName='text-3xl' />
        </View>

        <UpdateProfileForm />

        <Separator className='my-2' />

        <SectionLabel>Password</SectionLabel>
        {user.provider === 'local' ? (
          <ChangePasswordForm />
        ) : (
          <Text className='text-muted-foreground'>
            You sign in with {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}, so
            there's no FairShare password to change.
          </Text>
        )}
      </KeyboardAwareScrollView>
    </>
  )
}
