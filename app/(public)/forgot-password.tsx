import { View } from 'react-native'
import { Link } from 'expo-router'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { useForgotPassword } from '@/hooks/use-forgot-password'
import { getErrorMessage } from '@/lib/utils'

import { MailCheckIcon, MailIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Spinner } from '@/components/spinner'

const { fieldContext, formContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
})

export default function ForgotPasswordScreen() {
  const forgotPassword = useForgotPassword()

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      // Pass a schema or function to validate
      onSubmit: z.object({
        email: z.email('Enter a valid email').min(1, 'Enter your email'),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword.mutateAsync(value)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  const footer = (
    <>
      <Text className='text-muted-foreground'>Remembered it? </Text>
      <Link asChild href={'/login'}>
        <Text className='text-primary font-semibold'>Back to sign in</Text>
      </Link>
    </>
  )

  if (forgotPassword.isSuccess) {
    return (
      <AuthLayout
        showBack
        icon={MailCheckIcon}
        title='Check your inbox'
        subtitle={`If an account exists for ${forgotPassword.variables?.email}, a reset link is on its way. It can take a minute, so check spam too.`}
      >
        <View className='gap-3'>
          <Link asChild href={'/login'}>
            <Button className='w-full'>
              <Text>Back to sign in</Text>
            </Button>
          </Link>
          <Button variant='ghost' className='w-full' onPress={() => forgotPassword.reset()}>
            <Text>Use a different email</Text>
          </Button>
        </View>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      showBack
      icon={MailIcon}
      title='Reset your password'
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
      footer={footer}
    >
      <View className='gap-5'>
        <form.AppField
          name='email'
          children={field => (
            <View className='gap-2'>
              <Label htmlFor='email'>Email</Label>
              <field.Input
                id='email'
                placeholder='you@example.com'
                keyboardType='email-address'
                autoComplete='email'
                autoCapitalize='none'
                returnKeyType='send'
                onSubmitEditing={() => form.handleSubmit()}
                value={field.state.value}
                onChangeText={field.handleChange}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.reverse()[0]?.message}
                </Text>
              )}
            </View>
          )}
        />
        <Button
          className='w-full'
          disabled={forgotPassword.isPending}
          onPress={() => form.handleSubmit()}
        >
          {forgotPassword.isPending ? <Spinner /> : null}
          <Text>Send reset link</Text>
        </Button>
      </View>
    </AuthLayout>
  )
}
