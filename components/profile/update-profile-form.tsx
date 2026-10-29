import { ActivityIndicator, View } from 'react-native'
import { Stack } from 'expo-router'
import { LockIcon } from 'lucide-react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { useAuth } from '@/lib/auth-context'
import { useUpdateProfileMutation } from '@/services/profile'

import { getErrorMessage } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email(),
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

export function UpdateProfileForm() {
  const { user, setUser } = useAuth()
  const updateProfile = useUpdateProfileMutation()

  const form = useAppForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
    validators: {
      onSubmit: UpdateProfileSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const updatedUser = await updateProfile.mutateAsync(value)
        // Re-baseline the form so it's no longer "dirty"
        formApi.reset({ name: updatedUser.name, email: updatedUser.email })
        setUser({ ...user!, ...updatedUser })
        toast.success('Account updated')
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <View className='gap-5'>
      {/* Save sits in the header, disabled until the name changes */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <form.Subscribe
              selector={state => ({
                isDefaultValue: state.isDefaultValue,
                isSubmitting: state.isSubmitting,
              })}
              children={({ isDefaultValue, isSubmitting }) => (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isSubmitting || isDefaultValue}
                  onPress={() => form.handleSubmit()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className='text-primary'>Save</Text>
                  )}
                </Button>
              )}
            />
          ),
        }}
      />

      <View className='gap-2'>
        <Label htmlFor='name'>Name</Label>
        <form.AppField
          name='name'
          children={field => (
            <>
              <field.Input
                id='name'
                autoComplete='name'
                autoCapitalize='words'
                returnKeyType='done'
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                onSubmitEditing={() => form.handleSubmit()}
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

      <View className='gap-2'>
        <Label htmlFor='email'>Email</Label>
        <form.AppField
          name='email'
          children={field => (
            <>
              <View className='justify-center'>
                <field.Input
                  id='email'
                  editable={false}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  className='bg-muted pr-11 opacity-100'
                  value={field.state.value}
                  onChangeText={field.handleChange}
                />
                <View
                  pointerEvents='none'
                  className='absolute inset-y-0 right-0 w-11 items-center justify-center'
                >
                  <Icon as={LockIcon} className='text-muted-foreground size-4' />
                </View>
              </View>
              <Text className='text-muted-foreground text-sm'>
                Your email is how you sign in, so it can't be changed.
              </Text>
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors.map(e => e?.message).join(', ')}
                </Text>
              )}
            </>
          )}
        />
      </View>
    </View>
  )
}

export default UpdateProfileForm
