import { ActivityIndicator, View } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { useAuth } from '@/lib/auth-context'
import { useUpdateProfileMutation } from '@/services/profile'

import { getErrorMessage } from '@/lib/utils'

import { Button } from '@/components/ui/button'
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
    <View className='gap-6'>
      <View className='gap-1.5'>
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

      <View className='gap-1.5'>
        <Label htmlFor='email'>Email</Label>
        <form.AppField
          name='email'
          children={field => (
            <>
              <field.Input
                id='email'
                editable={false}
                keyboardType='email-address'
                autoCapitalize='none'
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
            {isSubmitting ? <ActivityIndicator /> : <Text>Update Account</Text>}
          </Button>
        )}
      />
    </View>
  )
}

export default UpdateProfileForm
