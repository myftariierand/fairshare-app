import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'

import { useForgotPassword } from '@/hooks/use-forgot-password'

import { HandshakeIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner-native'
import { getErrorMessage } from '@/lib/utils'
import { Link } from 'expo-router'

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
        email: z.email(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword.mutate(value)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerClassName='sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe'
          keyboardDismissMode='interactive'
        >
          <Icon as={HandshakeIcon} size={64} />
          {forgotPassword.isSuccess ? (
            <>
              <Text variant={'muted'} textBreakStrategy='balanced' className='my-4 text-center'>
                If the email exists, we've sent you a reset link. Please check your inbox.
              </Text>
              <Link asChild href={'/(public)/login'}>
                <Text variant={'small'} className='underline'>
                  Back to Login
                </Text>
              </Link>
            </>
          ) : (
            <>
              <Text variant={'muted'} textBreakStrategy='balanced' className='my-4 text-center'>
                Enter your email address and we will send you a link to reset your password.
              </Text>
              <form.AppField
                name='email'
                children={field => (
                  <>
                    <field.Input
                      id='email'
                      placeholder='Email'
                      keyboardType='email-address'
                      autoComplete='email'
                      autoCapitalize='none'
                      returnKeyType='next'
                      submitBehavior='submit'
                      value={field.state.value}
                      onChangeText={field.handleChange}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text className='text-destructive text-sm'>
                        {field.state.meta.errors.map(e => e?.message).join(', ')}
                      </Text>
                    )}
                  </>
                )}
              />
              <form.AppForm>
                <form.Button
                  disabled={forgotPassword.isPaused}
                  className='mt-3'
                  variant={'outline'}
                  onPress={() => form.handleSubmit()}
                >
                  <Text>Send Reset Link</Text>
                </form.Button>
              </form.AppForm>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
