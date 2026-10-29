import { Link } from 'expo-router'
import { View } from 'react-native'

import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import { AuthLayout } from '@/components/auth/auth-layout'
import { SignUpForm } from '@/components/sign-up-form'
import { SocialConnections } from '@/components/social-connections'

export default function RegisterScreen() {
  return (
    <AuthLayout
      showBack
      title='Create your account'
      subtitle='Takes a minute. Friends can find you by your email.'
      footer={
        <>
          <Text className='text-muted-foreground'>Already have an account? </Text>
          <Link asChild href={'/login'}>
            <Text className='text-primary font-semibold'>Sign in</Text>
          </Link>
        </>
      }
    >
      <SignUpForm />
      <View className='my-5 flex-row items-center'>
        <Separator className='flex-1' />
        <Text className='text-muted-foreground px-4 text-sm'>or</Text>
        <Separator className='flex-1' />
      </View>
      <SocialConnections label='Sign up with Google' />
    </AuthLayout>
  )
}
