import { useRef } from 'react'
import { type TextInputInstance, View } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { signUp } from '@/lib/auth'

import { useAuth } from '@/lib/auth-context'
import { useRefetchProfile } from '@/services/profile'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { cn, getErrorMessage } from '@/lib/utils'

import { PasswordInput } from '@/components/password-input'
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

// Rough guide only: the server rule is just 8+ characters
function getPasswordStrength(password: string) {
  if (!password) return null
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /\d/.test(password),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = Math.min(4, checks.filter(Boolean).length)
  if (password.length < 8) return { score: 1, label: 'Too short · use at least 8 characters' }
  if (score <= 2) return { score: 2, label: 'Okay · add a number or symbol to make it stronger' }
  if (score === 3) return { score: 3, label: 'Good' }
  return { score: 4, label: 'Strong' }
}

export function SignUpForm() {
  const emailInputRef = useRef<TextInputInstance>(null)
  const passwordInputRef = useRef<TextInputInstance>(null)
  const confirmInputRef = useRef<TextInputInstance>(null)

  const { setTokens, setUser } = useAuth()
  const refetchProfile = useRefetchProfile()

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
          name: z.string().min(1, 'Enter your name'),
          email: z.email('Enter a valid email').min(1, 'Enter your email'),
          password: z.string().min(8, 'Use at least 8 characters'),
          confirmPassword: z.string(),
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
        const { accessToken, refreshToken } = await signUp(value)
        await setTokens({ accessToken, refreshToken })
        const user = await refetchProfile()
        setUser(user)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <View className='gap-5'>
      <form.AppField
        name='name'
        children={field => (
          <View className='gap-2'>
            <Label>Name</Label>
            <field.Input
              placeholder='What friends call you'
              autoComplete='name'
              autoCapitalize='words'
              returnKeyType='next'
              onSubmitEditing={() => emailInputRef.current?.focus()}
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
      <form.AppField
        name='email'
        children={field => (
          <View className='gap-2'>
            <Label>Email</Label>
            <field.Input
              placeholder='you@example.com'
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
                {field.state.meta.errors.reverse()[0]?.message}
              </Text>
            )}
          </View>
        )}
      />
      <form.AppField
        name='password'
        children={field => (
          <View className='gap-2'>
            <Label>Password</Label>
            <PasswordInput
              returnKeyType='next'
              autoComplete='new-password'
              ref={passwordInputRef}
              onSubmitEditing={() => confirmInputRef.current?.focus()}
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder='At least 8 characters'
            />
            {field.state.meta.errors.length > 0 ? (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.reverse()[0]?.message}
              </Text>
            ) : (
              <PasswordStrength password={field.state.value} />
            )}
          </View>
        )}
      />
      <form.AppField
        name='confirmPassword'
        children={field => (
          <View className='gap-2'>
            <Label>Confirm password</Label>
            <PasswordInput
              returnKeyType='send'
              autoComplete='new-password'
              ref={confirmInputRef}
              onSubmitEditing={() => form.handleSubmit()}
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder='Type it again'
            />
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.reverse()[0]?.message}
              </Text>
            )}
          </View>
        )}
      />
      <form.Subscribe
        selector={state => state.isSubmitting}
        children={isSubmitting => (
          <Button
            className='mt-2 w-full'
            disabled={isSubmitting}
            onPress={() => form.handleSubmit()}
          >
            {isSubmitting ? <Spinner /> : null}
            <Text>Create account</Text>
          </Button>
        )}
      />
    </View>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!strength) return null

  return (
    <View
      className='gap-1.5'
      accessible
      accessibilityLabel={`Password strength: ${strength.label}`}
    >
      <View className='flex-row gap-1.5'>
        {[1, 2, 3, 4].map(step => (
          <View
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full',
              step <= strength.score
                ? strength.score === 1
                  ? 'bg-destructive'
                  : 'bg-primary'
                : 'bg-border'
            )}
          />
        ))}
      </View>
      <Text className='text-muted-foreground text-sm'>{strength.label}</Text>
    </View>
  )
}
