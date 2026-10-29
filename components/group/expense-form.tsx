import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { toast } from 'sonner-native'
import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAppForm } from '@/lib/form'
import { useAuthUser } from '@/lib/auth-context'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { useCreateExpense, useGetGroupById, useUpdateExpense } from '@/services/group'

import {
  formatAmount,
  fromMinorUnit,
  getErrorMessage,
  parseNumberInput,
  sanitizeNumberInput,
  toMinorUnit,
  transactionCategories,
} from '@/lib/utils'

import { SaveIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { ExpenseSplits } from '@/components/group/expense-splits'
import { Spinner } from '@/components/spinner'
import { SingleTransaction, type TransactionCategory } from '@/types/group'
import { CategoryGlyph } from '@/components/category-icon'

export const expenseFormOpts = formOptions({
  defaultValues: {
    category: 'OTHER',
    description: '',
    amount: '',
    paidBy: '',
    splits: [] as { name: string; userId: string; amount: string }[],
  },
})

export function ExpenseForm({ data }: { data?: SingleTransaction }) {
  const insets = useSafeAreaInsets()
  const user = useAuthUser()
  const { groupId } = useGroupIdParam()
  const { data: group } = useGetGroupById(groupId)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const form = useAppForm({
    defaultValues: {
      category: 'OTHER',
      description: '',
      amount: '',
      paidBy: user.id,
      splits: (group?.members ?? []).map(({ name, id }) => ({
        name,
        userId: id,
        amount: '',
      })),
    },
    validators: {
      onSubmit: z.object({
        category: z.string(),
        description: z.string().min(1, 'Expense description is required'),
        amount: z.string().refine(val => parseNumberInput(val) > 0, {
          message: 'Expense amount is required',
        }),
        paidBy: z.uuid(),
        splits: z
          .object({
            name: z.string(),
            userId: z.uuid(),
            amount: z.string().refine(val => parseNumberInput(val) > 0, {
              message: 'Amount must be a positive number',
            }),
          })
          .array(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const transformedData = {
          ...value,
          groupId,
          amount: parseNumberInput(value.amount),
          splits: value.splits.map(split => ({
            ...split,
            amount: +split.amount,
          })),
        } as any

        if (data) {
          transformedData.id = data.id
          await updateExpense.mutateAsync(transformedData)
          toast.success('Exepense updated')
          router.navigate(`/groups/${groupId}`)
        } else {
          await createExpense.mutateAsync(transformedData)
          toast.success('Exepense added')
          router.back()
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    },
  })

  const handleChange = (value: string) => {
    const currency = group?.currency ?? 'EUR'

    const amount = sanitizeNumberInput(value)
    form.setFieldValue('amount', amount)

    const selectedGroupedMembers = form.getFieldValue('splits').length

    const unitAmount = toMinorUnit(+amount, currency)
    const base = Math.floor(unitAmount / selectedGroupedMembers)
    const remainder = unitAmount % selectedGroupedMembers

    const updatedSplits = form.getFieldValue('splits').map((split, i) => ({
      ...split,
      amount: fromMinorUnit(base + (i < remainder ? 1 : 0), currency),
    }))

    form.setFieldValue('splits', updatedSplits)
  }

  const [splitEqually, setSplitEqually] = useState(true)

  const handleSplitEqually = (checked: boolean) => {
    if (!group) return

    const amount = form.getFieldValue('amount')

    if (!(+amount > 0)) {
      toast.warning('Enter a cost for your expense first')
      return
    }

    setSplitEqually(checked)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (checked) {
      const unitAmount = toMinorUnit(+amount, group.currency)
      const base = Math.floor(unitAmount / group.members.length)
      const remainder = unitAmount % group.members.length

      const updatedSplits = form.getFieldValue('splits').map((split, i) => {
        return {
          ...split,
          amount: fromMinorUnit(base + (i < remainder ? 1 : 0), group.currency),
        }
      })

      form.setFieldValue('splits', updatedSplits)
    }
  }

  useEffect(() => {
    if (!data) return
    form.reset({
      category: data.category ?? '',
      description: data.description,
      amount: data.amount.toString(),
      paidBy: data.paidById,
      splits: data.splits.map(({ amount, user }) => ({
        name: user.name,
        userId: user.id,
        amount: amount.toString(),
      })),
    })
  }, [data])

  const { progress } = useReanimatedKeyboardAnimation()
  const footerStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(progress.value, [0, 1], [16, 0]),
    paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom, 0]),
  }))

  return (
    <>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerClassName='p-4 gap-2'
        keyboardDismissMode='interactive'
        bottomOffset={200}
      >
        <form.AppField
          name='category'
          children={field => (
            <ToggleGroup
              type='single'
              className='flex-col'
              value={field.state.value}
              onValueChange={value => {
                if (value) field.handleChange(value)
              }}
            >
              <View className='flex-row flex-wrap justify-start gap-1'>
                {Object.entries(transactionCategories)
                  .slice(0, 10)
                  .map(([value, { label }]) => (
                    <ToggleGroupItem
                      key={label}
                      value={value}
                      className='shrink-0 grow whitespace-nowrap'
                      size={'sm'}
                      variant={'outline'}
                    >
                      <CategoryGlyph
                        category={value as TransactionCategory}
                        iconClassName='size-4'
                      />
                      <Text>{label}</Text>
                    </ToggleGroupItem>
                  ))}
              </View>
              <Collapsible className='grow'>
                <CollapsibleContent className='flex-row flex-wrap gap-1'>
                  {Object.entries(transactionCategories)
                    .slice(10)
                    .map(([value, { label }]) => (
                      <ToggleGroupItem
                        key={label}
                        value={value}
                        className='shrink-0 grow whitespace-nowrap'
                        size={'sm'}
                        variant={'outline'}
                      >
                        <CategoryGlyph
                          category={value as TransactionCategory}
                          iconClassName='size-4'
                        />
                        <Text>{label}</Text>
                      </ToggleGroupItem>
                    ))}
                </CollapsibleContent>
                <CollapsibleTrigger asChild>
                  <Button variant={'link'}>
                    <Text>More Categories</Text>
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </ToggleGroup>
          )}
        />
        <form.AppField
          name='description'
          children={field => (
            <View className='gap-1'>
              <Label>Description*</Label>
              <field.Input
                placeholder='Plane Tickets'
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
          name='amount'
          children={field => (
            <View className='gap-1'>
              <Label>Amount*</Label>
              <field.Input
                inputMode='decimal'
                placeholder={formatAmount(600, group?.currency ?? 'EUR')}
                value={field.state.value}
                onChangeText={handleChange}
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
          name='paidBy'
          children={field => (
            <ToggleGroup
              type='single'
              className='flex-wrap justify-start'
              value={field.state.value}
              onValueChange={value => {
                if (value) field.handleChange(value)
              }}
            >
              {(group ? [...group.members] : [])
                .sort(a => (a.id === user.id ? -1 : 1))
                .map(member => (
                  <ToggleGroupItem
                    key={member.id}
                    value={member.id}
                    className='shrink-0 whitespace-nowrap'
                    variant={'outline'}
                  >
                    <Avatar className='size-5' alt={user.name}>
                      <AvatarFallback className='border'>
                        <Text className='text-xs'>{member.name.slice(0, 2)}</Text>
                      </AvatarFallback>
                    </Avatar>
                    <Text>{user.id === member.id ? 'You' : member.name.split(' ')[0]}</Text>
                  </ToggleGroupItem>
                ))}
            </ToggleGroup>
          )}
        />
        <Card className='flex flex-row items-center justify-between p-4'>
          <View className='shrink'>
            <Text className='text-base'>Split Equally</Text>
            <Text variant={'muted'} className='text-xs' textBreakStrategy='balanced'>
              Disable this if you want to manually specify the split amounts for each group member.
            </Text>
          </View>
          <View>
            <Switch checked={splitEqually} onCheckedChange={handleSplitEqually} />
          </View>
        </Card>
        {!splitEqually && group && <ExpenseSplits form={form} group={group} />}
      </KeyboardAwareScrollView>
      <KeyboardStickyView className='bg-background' offset={{ closed: 0, opened: 0 }}>
        <Animated.View style={footerStyle}>
          <form.AppForm>
            <form.Button
              className='w-full'
              disabled={createExpense.isPending || updateExpense.isPending}
              onPress={() => form.handleSubmit()}
            >
              {createExpense.isPending || updateExpense.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Icon as={SaveIcon} />
                  <Text>Save</Text>
                </>
              )}
            </form.Button>
          </form.AppForm>
        </Animated.View>
      </KeyboardStickyView>
    </>
  )
}
