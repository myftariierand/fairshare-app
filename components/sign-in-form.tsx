import { useRef } from 'react'
import { type TextInput, View } from 'react-native'
import { Link } from 'expo-router'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'sonner-native'

import { login } from '@/lib/auth'

import { useAuth } from '@/lib/auth-context'
import { useRefetchProfile } from '@/services/profile'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import { PasswordInput } from '@/components/password-input'
import { SocialConnections } from '@/components/social-connections'
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

export function SignInForm() {
  const passwordInputRef = useRef<TextInput>(null)

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus()
  }

  const { setTokens, setUser } = useAuth()
  const refetchProfile = useRefetchProfile()

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      // Pass a schema or function to validate
      onSubmit: z.object({
        email: z.email('Enter a valid email').min(1, 'Enter your email'),
        password: z.string().min(1, 'Enter your password'),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const { accessToken, refreshToken } = await login(value)
        await setTokens({ accessToken, refreshToken })
        const user = await refetchProfile()
        setUser(user)
      } catch (e) {
        if (axios.isAxiosError(e)) {
          toast.error(e.response?.data?.message ?? 'Could not reach the server')
        } else {
          toast.error('Something went wrong')
        }
      }
    },
  })

  return (
    <View className='gap-5'>
      <View className='gap-2'>
        <Label htmlFor='email'>Email</Label>
        <form.AppField
          name='email'
          children={field => (
            <>
              <field.Input
                id='email'
                placeholder='you@example.com'
                keyboardType='email-address'
                autoComplete='email'
                autoCapitalize='none'
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType='next'
                submitBehavior='submit'
                value={field.state.value}
                onChangeText={field.handleChange}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.reverse()[0]?.message}
                </Text>
              )}
            </>
          )}
        />
      </View>
      <View className='gap-2'>
        <View className='flex-row items-center justify-between'>
          <Label htmlFor='password'>Password</Label>
          <Link asChild href={'/forgot-password'}>
            <Text className='text-primary text-sm font-medium'>Forgot password?</Text>
          </Link>
        </View>
        <form.AppField
          name='password'
          children={field => (
            <>
              <PasswordInput
                id='password'
                returnKeyType='send'
                autoComplete='current-password'
                ref={passwordInputRef}
                onSubmitEditing={() => form.handleSubmit()}
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder='Your password'
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.reverse()[0]?.message}
                </Text>
              )}
            </>
          )}
        />
      </View>
      <form.Subscribe
        selector={state => state.isSubmitting}
        children={isSubmitting => (
          <Button
            className='mt-2 w-full'
            disabled={isSubmitting}
            onPress={() => form.handleSubmit()}
          >
            {isSubmitting ? <Spinner /> : null}
            <Text>Sign in</Text>
          </Button>
        )}
      />

      <View className='flex-row items-center'>
        <Separator className='flex-1' />
        <Text className='text-muted-foreground px-4 text-sm'>or</Text>
        <Separator className='flex-1' />
      </View>
      <SocialConnections />
    </View>
  )
}
