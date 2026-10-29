import { Stack } from 'expo-router'
import { ScrollView, View } from 'react-native'

import { useAuthUser } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import UpdateProfileForm from '@/components/profile/update-profile-form'
import ChangePasswordForm from '@/components/profile/change-password-form'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function EditProfileScreen() {
  const user = useAuthUser()

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <SafeAreaView edges={['bottom']}>
        <ScrollView>
          <View className='mx-2 my-3 gap-3'>
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you're done.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateProfileForm />
              </CardContent>
            </Card>
            {user.provider === 'local' && (
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
