import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
// import DateTimePicker from '@expo/ui/community/datetime-picker';
import { toast } from 'sonner-native'
import { router } from 'expo-router'

import { useCreateGroup } from '@/hooks/use-group-api'

import { Check } from 'lucide-react-native'

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
import { Icon } from '@/components/ui/icon'
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

const coverSchema = z.object({
  uri: z.string(),
  width: z.number(),
  height: z.number(),
  fileName: z.string().nullish(),
  mimeType: z.string().optional(),
})

type CoverSchemaType = z.infer<typeof coverSchema>

const CreateGroupForm = () => {
  const createGroup = useCreateGroup()

  const form = useAppForm({
    defaultValues: {
      name: '',
      currency: '',
      cover: null as CoverSchemaType | null,
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(4, { message: 'Name must be at least 4 characters.' }),
        currency: z.string().min(1, { message: 'Select a currency.' }),
        cover: coverSchema.nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await createGroup.mutateAsync(value)
        toast.success('Group created')
        router.back()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Something went wrong')
      }
    },
  })

  //   const [show, setShow] = useState(false);
  //   const [date, setDate] = useState(new Date());

  return (
    <View className='h-full gap-2 p-4'>
      <form.Field name='cover'>
        {field => (
          <View className='gap-2'>
            <CoverPicker value={field.state.value} onChange={field.handleChange} />
          </View>
        )}
      </form.Field>
      <form.AppField
        name='name'
        children={field => (
          <View className='gap-1'>
            <Label>Group Name</Label>
            <field.Input
              placeholder='Summer 2024 Trip'
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
        name='currency'
        children={field => (
          <View className='gap-1'>
            <Label>Currency</Label>
            <Select
              value={
                field.state.value
                  ? {
                      label:
                        currencies.find(currency => currency.code === field.state.value)?.name ??
                        '',
                      value: field.state.value,
                    }
                  : undefined
              }
              onValueChange={option => {
                field.handleChange(option?.value ?? '')
                field.handleBlur()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a currency' />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.code} label={currency.name} value={currency.code} />
                ))}
              </SelectContent>
            </Select>
            {field.state.meta.errors.length > 0 && (
              <Text className='text-destructive text-sm'>
                {field.state.meta.errors.map(e => e?.message).join(', ')}
              </Text>
            )}
          </View>
        )}
      />
      {/* <View className="gap-1">
        <Label>Date</Label>
        <Button variant={'outline'} onPress={() => setShow(true)}>
          <Icon as={CalendarIcon} />
          <Text>Start Date</Text>
        </Button>
        {show && (
          <DateTimePicker
            value={date}
            onValueChange={(event, selectedDate) => {
              setShow(false);
              setDate(selectedDate);
            }}
            onDismiss={() => {
              setShow(false);
            }}
            mode="date"
            presentation="dialog"
          />
        )}
      </View> */}
      <Button
        size={'lg'}
        disabled={createGroup.isPending}
        onPress={() => form.handleSubmit()}
        className='mt-auto'
      >
        {createGroup.isPending ? (
          <Spinner />
        ) : (
          <>
            <Icon as={Check} />
            <Text>Create</Text>
          </>
        )}
      </Button>
    </View>
  )
}

export default CreateGroupForm
