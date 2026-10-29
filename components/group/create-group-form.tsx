import { Pressable, View } from 'react-native'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner-native'
import { router } from 'expo-router'
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { inviteToGroup, useCreateGroup } from '@/services/group'
import { useGetFriendsQuery } from '@/services/friends'
import { cn, getErrorMessage } from '@/lib/utils'

import { Check, CheckIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
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
  const insets = useSafeAreaInsets()
  const createGroup = useCreateGroup()
  const { data: friends = [] } = useGetFriendsQuery()

  const form = useAppForm({
    defaultValues: {
      name: '',
      currency: '',
      cover: null as CoverSchemaType | null,
      invite: [] as string[],
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, { message: 'Give the group a name' }),
        currency: z.string().min(1, { message: 'Pick a currency' }),
        cover: coverSchema.nullable(),
        invite: z.string().array(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const { invite, ...group } = value
        const created = await createGroup.mutateAsync(group)

        // The group exists at this point; invites are best effort
        const results = await Promise.allSettled(
          invite.map(userId => inviteToGroup({ groupId: created.id, userId }))
        )
        const failed = results.filter(r => r.status === 'rejected').length

        if (failed) {
          toast.warning(`Group created, but ${failed} invite${failed > 1 ? 's' : ''} didn't send`)
        } else {
          toast.success(invite.length ? 'Group created and invites sent' : 'Group created')
        }
        router.back()
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    },
  })

  // Same footer as the expense form: inset while the keyboard is closed,
  // flush against it while it's open
  const { progress } = useReanimatedKeyboardAnimation()
  const footerStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(progress.value, [0, 1], [16, 0]),
    paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom + 8, 0]),
  }))

  return (
    <View className='flex-1'>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        bottomOffset={24}
        contentContainerStyle={{ padding: 20, gap: 24 }}
      >
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
                <Label nativeID='group-name'>Group name</Label>
                <field.Input
                  aria-labelledby='group-name'
                  placeholder='Summer trip 2027'
                  autoFocus
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
                  <SelectTrigger className='justify-start'>
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
                {field.state.meta.errors.length > 0 && (
                  <Text className='text-destructive text-sm'>
                    {field.state.meta.errors[0]?.message}
                  </Text>
                )}
              </View>
            )
          }}
        />

        {friends.length > 0 && (
          <form.Field name='invite'>
            {field => {
              const invited = field.state.value
              const toggle = (id: string) =>
                field.handleChange(
                  invited.includes(id) ? invited.filter(i => i !== id) : [...invited, id]
                )

              return (
                <View className='gap-2'>
                  <SectionLabel>
                    Invite friends{invited.length ? ` · ${invited.length} selected` : ''}
                  </SectionLabel>
                  <Card className='gap-0 px-4 py-0'>
                    {friends.map((friend, index) => {
                      const on = invited.includes(friend.id)
                      return (
                        <View key={friend.id}>
                          {index > 0 && <Separator />}
                          <Pressable
                            role='checkbox'
                            aria-checked={on}
                            accessibilityLabel={`Invite ${friend.name}`}
                            onPress={() => toggle(friend.id)}
                            className='min-h-14 flex-row items-center gap-3 py-2 active:opacity-70'
                          >
                            <InitialsAvatar
                              name={friend.name}
                              className='size-9'
                              textClassName='text-xs'
                            />
                            <Text className='flex-1 font-medium' numberOfLines={1}>
                              {friend.name}
                            </Text>
                            <View
                              className={cn(
                                'size-6 items-center justify-center rounded-md border-2',
                                on ? 'bg-primary border-primary' : 'border-muted-foreground/60'
                              )}
                            >
                              {on && (
                                <Icon as={CheckIcon} className='text-primary-foreground size-4' />
                              )}
                            </View>
                          </Pressable>
                        </View>
                      )
                    })}
                  </Card>
                  <Text className='text-muted-foreground text-sm'>
                    They'll get an invite to join. You can also share a link or QR code later.
                  </Text>
                </View>
              )
            }}
          </form.Field>
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView className='bg-background' offset={{ closed: 0, opened: 0 }}>
        <Animated.View style={footerStyle}>
          <form.Subscribe
            selector={state => state.isSubmitting}
            children={isSubmitting => (
              <Button
                className='w-full'
                disabled={isSubmitting}
                onPress={() => form.handleSubmit()}
              >
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    <Icon as={Check} />
                    <Text>Create group</Text>
                  </>
                )}
              </Button>
            )}
          />
        </Animated.View>
      </KeyboardStickyView>
    </View>
  )
}

export default CreateGroupForm
