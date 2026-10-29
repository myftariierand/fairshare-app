import { Link, Stack } from 'expo-router'

import { Text } from '@/components/ui/text'

import { AuthLayout } from '@/components/auth/auth-layout'
import { SignInForm } from '@/components/sign-in-form'

export default function SignInScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthLayout
        title={'Split costs,\nnot friendships.'}
        subtitle='Sign in to see what you owe and who owes you.'
        footer={
          <>
            <Text className='text-muted-foreground'>New to FairShare? </Text>
            <Link asChild href={'/register'}>
              <Text className='text-primary font-semibold'>Create an account</Text>
            </Link>
          </>
        }
      >
        <SignInForm />
      </AuthLayout>
    </>
  )
}
