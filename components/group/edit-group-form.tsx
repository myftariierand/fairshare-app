import { View } from 'react-native'
import { Stack } from 'expo-router'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'

import { useUpdateGroup } from '@/services/group'
import { getErrorMessage } from '@/lib/utils'

import type { SingleGroup } from '@/types/group'

import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/spinner'
import { CoverPicker } from '@/components/cover-picker'

const { fieldContext, formContext } = createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: { Input },
  formComponents: { Button },
  fieldContext,
  formContext,
})

const currencies = [
  { code: 'EUR', name: 'Euro' },
  { code: 'ALL', name: 'Albanian Lek' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
]

const coverSchema = z
  .object({
    uri: z.string(),
    width: z.number(),
    height: z.number(),
    fileName: z.string().nullish(),
    mimeType: z.string().optional(),
  })
  .or(z.object({ uri: z.string() }))

type CoverSchemaType = z.infer<typeof coverSchema>

export const EditGroupForm = ({ data }: { data: SingleGroup }) => {
  const updateGroup = useUpdateGroup()

  const form = useAppForm({
    defaultValues: {
      name: data.name,
      currency: data.currency,
      cover: data.cover
        ? { uri: process.env.EXPO_PUBLIC_IMG_URL + '/' + data.cover }
        : (null as CoverSchemaType | null),
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, { message: 'Give the group a name' }),
        currency: z.string().min(1, { message: 'Pick a currency' }),
        cover: coverSchema.nullable(),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateGroup.mutateAsync({ id: data.id, ...value })
        // Re-baseline so Save goes back to disabled
        formApi.reset(value)
        toast.success('Group updated')
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  return (
    <View className='gap-5'>
      {/* Save sits in the header, disabled until something changes */}
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
                  {isSubmitting ? <Spinner /> : <Text className='text-primary'>Save</Text>}
                </Button>
              )}
            />
          ),
        }}
      />

      <View className='flex-row items-start gap-4'>
        <form.Field name='cover'>
          {field => (
            <CoverPicker variant='tile' value={field.state.value} onChange={field.handleChange} />
          )}
        </form.Field>
        <form.AppField
          name='name'
          children={field => (
            <View className='flex-1 gap-2 pt-1'>
              <Label>Group name</Label>
              <field.Input
                placeholder='Summer trip 2027'
                returnKeyType='done'
                value={field.state.value}
                onChangeText={field.handleChange}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>

      <form.AppField
        name='currency'
        children={field => {
          const selected = currencies.find(c => c.code === field.state.value)
          return (
            <View className='gap-2'>
              <Label>Currency</Label>
              <Select
                value={selected ? { label: selected.name, value: selected.code } : undefined}
                onValueChange={option => {
                  field.handleChange(option?.value ?? '')
                  field.handleBlur()
                }}
              >
                {/* Locked after creation, as before */}
                <SelectTrigger disabled className='justify-start'>
                  {selected && (
                    <View className='bg-secondary rounded-md px-2 py-1'>
                      <Text className='font-mono text-xs font-semibold'>{selected.code}</Text>
                    </View>
                  )}
                  <View className='flex-1'>
                    <SelectValue placeholder='Pick a currency' />
                  </View>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem
                      key={currency.code}
                      label={`${currency.code} · ${currency.name}`}
                      value={currency.code}
                    />
                  ))}
                </SelectContent>
              </Select>
            </View>
          )
        }}
      />
    </View>
  )
}
