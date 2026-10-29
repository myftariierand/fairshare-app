import { Stack } from 'expo-router'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuthUser } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { useCenteredHeader } from '@/components/header-button'
import UpdateProfileForm from '@/components/profile/update-profile-form'
import ChangePasswordForm from '@/components/profile/change-password-form'

export default function EditProfileScreen() {
  const user = useAuthUser()
  const insets = useSafeAreaInsets()
  const headerOptions = useCenteredHeader('Account')

  return (
    <>
      <Stack.Screen options={headerOptions} />
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
