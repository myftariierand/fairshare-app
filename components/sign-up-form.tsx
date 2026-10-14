import { useRef, useState } from 'react'
import { type TextInput, View } from 'react-native'
import { Link } from 'expo-router'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'sonner-native'

import { signUp } from '@/lib/auth'

import { useAuth } from '@/lib/auth-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { getErrorMessage } from '@/lib/utils'

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

export function SignUpForm() {
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const { setTokens, setUser } = useAuth()

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      // Pass a schema or function to validate
      onSubmit: z
        .object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(8),
          confirmPassword: z.string().min(1),
        })
        .superRefine((args, ctx) => {
          if (args.password !== args.confirmPassword) {
            ctx.addIssue({
              code: 'custom',
              message: 'The passwords did not match',
              path: ['confirmPassword'],
            })
          }
        }),
    },
    onSubmit: async ({ value }) => {
      try {
        const { accessToken, refreshToken, user } = await signUp(value)
        await setTokens({ accessToken, refreshToken })
        setUser(user)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <View className='gap-3'>
      <form.AppField
        name='name'
        children={field => (
          <View className='gap-1.5'>
            <Label>Name</Label>
            <field.Input
              placeholder='John'
              autoComplete='name'
              autoCapitalize='words'
              returnKeyType='next'
              onSubmitEditing={() => emailInputRef.current?.focus()}
              value={field.state.value}
              onChangeText={field.handleChange}
            />
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.map(e => e?.message).join(', ')}
              </Text>
            )}
          </View>
        )}
      />
      <form.AppField
        name='email'
        children={field => (
          <View className='gap-1.5'>
            <Label>Email</Label>
            <field.Input
              placeholder='m@example.com'
              keyboardType='email-address'
              autoComplete='email'
              autoCapitalize='none'
              ref={emailInputRef}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              returnKeyType='next'
              value={field.state.value}
              onChangeText={field.handleChange}
            />
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.map(e => e?.message).join(', ')}
              </Text>
            )}
          </View>
        )}
      />
      <form.AppField
        name='password'
        children={field => (
          <View className='gap-1.5'>
            <Label>Password</Label>
            <field.Input
              secureTextEntry
              returnKeyType='send'
              ref={passwordInputRef}
              onSubmitEditing={() => form.handleSubmit()}
              value={field.state.value}
              onChangeText={field.handleChange}
            />
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.map(e => e?.message).join(', ')}
              </Text>
            )}
          </View>
        )}
      />
      <form.AppField
        name='confirmPassword'
        children={field => (
          <View className='gap-1.5'>
            <Label>Confirm Password</Label>
            <field.Input
              secureTextEntry
              returnKeyType='send'
              value={field.state.value}
              onChangeText={field.handleChange}
            />
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.map(e => e?.message).join(', ')}
              </Text>
            )}
          </View>
        )}
      />
      <form.AppForm>
        <form.Button className='w-full' onPress={() => form.handleSubmit()}>
          <Text>Register</Text>
        </form.Button>
      </form.AppForm>
    </View>
  )
}
