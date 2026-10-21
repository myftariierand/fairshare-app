import { useRef } from 'react'
import { ActivityIndicator, type TextInput, View } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { useChangePasswordMutation } from '@/services/profile'

import { getErrorMessage } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'

const PasswordChangeSchema = z
  .object({
    password: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(1, 'New password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .superRefine((args, ctx) => {
    if (args.password === args.newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password cannot be the same as current password.',
        path: ['newPassword'],
      })
    }

    if (args.newPassword !== args.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match.',
        path: ['confirmPassword'],
      })
    }
  })

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

export function ChangePasswordForm() {
  const newPasswordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  const changePassword = useChangePasswordMutation()

  const form = useAppForm({
    defaultValues: {
      password: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: PasswordChangeSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await changePassword.mutateAsync(value)
        toast.success('Password changed successfully')
        formApi.reset()
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <View className='gap-6'>
      <View className='gap-1.5'>
        <Label htmlFor='password'>Current Password</Label>
        <form.AppField
          name='password'
          children={field => (
            <>
              <field.Input
                id='password'
                placeholder='Current password'
                secureTextEntry
                autoCapitalize='none'
                autoComplete='current-password'
                returnKeyType='next'
                submitBehavior='submit'
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.map(e => e?.message).join(', ')}
                </Text>
              )}
            </>
          )}
        />
      </View>

      <View className='gap-1.5'>
        <Label htmlFor='newPassword'>New Password</Label>
        <form.AppField
          name='newPassword'
          children={field => (
            <>
              <field.Input
                id='newPassword'
                ref={newPasswordRef}
                placeholder='New password'
                secureTextEntry
                autoCapitalize='none'
                autoComplete='new-password'
                returnKeyType='next'
                submitBehavior='submit'
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.map(e => e?.message).join(', ')}
                </Text>
              )}
            </>
          )}
        />
      </View>

      <View className='gap-1.5'>
        <Label htmlFor='confirmPassword'>Confirm New Password</Label>
        <form.AppField
          name='confirmPassword'
          children={field => (
            <>
              <field.Input
                id='confirmPassword'
                ref={confirmPasswordRef}
                placeholder='Confirm new password'
                secureTextEntry
                autoCapitalize='none'
                autoComplete='new-password'
                returnKeyType='send'
                onSubmitEditing={() => form.handleSubmit()}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.map(e => e?.message).join(', ')}
                </Text>
              )}
            </>
          )}
        />
      </View>

      <form.Subscribe
        selector={state => ({
          isDefaultValue: state.isDefaultValue,
          isSubmitting: state.isSubmitting,
        })}
        children={({ isDefaultValue, isSubmitting }) => (
          <Button
            className='w-full'
            disabled={isSubmitting || isDefaultValue}
            onPress={() => form.handleSubmit()}
          >
            {isSubmitting ? <ActivityIndicator /> : <Text>Update Password</Text>}
          </Button>
        )}
      />
    </View>
  )
}

export default ChangePasswordForm
