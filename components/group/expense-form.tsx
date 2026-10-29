import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { toast } from 'sonner-native'
import { useStore } from '@tanstack/react-form'
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
  cn,
  formatAmount,
  fromMinorUnit,
  getErrorMessage,
  parseNumberInput,
  sanitizeNumberInput,
  toMinorUnit,
  transactionCategories,
} from '@/lib/utils'

import { CheckIcon, MinusIcon, PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Spinner } from '@/components/spinner'
import { CategoryGlyph } from '@/components/category-icon'
import { SingleTransaction, type TransactionCategory } from '@/types/group'

type Split = { name: string; userId: string; amount: string }
type SplitMode = 'equally' | 'amounts' | 'shares'

// Split `total` by weight in minor units; leftover cents go to the first people
function distribute(
  total: number,
  people: { name: string; userId: string; weight: number }[],
  currency: string
): Split[] {
  const included = people.filter(p => p.weight > 0)
  const totalWeight = included.reduce((acc, p) => acc + p.weight, 0)
  if (!included.length || !totalWeight) return []

  const minor = toMinorUnit(total, currency)
  const parts = included.map(p => Math.floor((minor * p.weight) / totalWeight))
  let remainder = minor - parts.reduce((acc, n) => acc + n, 0)
  for (let i = 0; remainder > 0; i = (i + 1) % parts.length, remainder--) parts[i] += 1

  return included.map((p, i) => ({
    name: p.name,
    userId: p.userId,
    amount: fromMinorUnit(parts[i], currency),
  }))
}

const allEqual = (amounts: number[]) =>
  amounts.every(a => Math.abs(a - amounts[0]) <= 0.01 + Number.EPSILON)

export function ExpenseForm({ data }: { data?: SingleTransaction }) {
  const insets = useSafeAreaInsets()
  const user = useAuthUser()
  const { groupId } = useGroupIdParam()
  const { data: group } = useGetGroupById(groupId)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const currency = group?.currency ?? 'EUR'

  // You first, then everyone else in group order
  const members = useMemo(
    () =>
      [...(group?.members ?? [])].sort((a, b) =>
        a.id === user.id ? -1 : b.id === user.id ? 1 : 0
      ),
    [group?.members, user.id]
  )

  const [mode, setMode] = useState<SplitMode>('equally')
  // Equally: 0/1 per person. Shares: 0..n per person.
  const [weights, setWeights] = useState<Record<string, number>>({})
  const weightOf = (id: string) => weights[id] ?? 1

  const form = useAppForm({
    defaultValues: {
      category: 'OTHER',
      description: '',
      amount: '',
      paidBy: user.id,
      splits: members.map(({ name, id }) => ({ name, userId: id, amount: '' })) as Split[],
    },
    validators: {
      onSubmit: z
        .object({
          category: z.string(),
          description: z.string().trim().min(1, 'Add a short description'),
          amount: z.string().refine(val => parseNumberInput(val) > 0, {
            message: 'Enter an amount',
          }),
          paidBy: z.uuid(),
          splits: z.object({ name: z.string(), userId: z.uuid(), amount: z.string() }).array(),
        })
        .superRefine((value, ctx) => {
          const total = parseNumberInput(value.amount)
          if (!(total > 0)) return
          const amounts = value.splits.map(s => parseNumberInput(s.amount))
          if (!amounts.some(a => a > 0)) {
            ctx.addIssue({ code: 'custom', message: 'Pick at least one person', path: ['splits'] })
            return
          }
          const sum = amounts.reduce((acc, a) => acc + a, 0)
          if (Math.abs(sum - total) > 0.009) {
            ctx.addIssue({
              code: 'custom',
              path: ['splits'],
              message: `Split adds up to ${formatAmount(sum, currency)}, not ${formatAmount(total, currency)}`,
            })
          }
        }),
    },
    onSubmit: async ({ value }) => {
      try {
        const transformedData = {
          ...value,
          groupId,
          amount: parseNumberInput(value.amount),
          // People with nothing to pay aren't part of the split
          splits: value.splits
            .map(split => ({ ...split, amount: parseNumberInput(split.amount) }))
            .filter(split => split.amount > 0),
        } as any

        if (data) {
          transformedData.id = data.id
          await updateExpense.mutateAsync(transformedData)
          toast.success('Expense updated')
          router.navigate(`/groups/${groupId}`)
        } else {
          await createExpense.mutateAsync(transformedData)
          toast.success('Expense added')
          router.back()
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    },
  })

  const amount = useStore(form.store, s => s.values.amount)
  const splits = useStore(form.store, s => s.values.splits)
  const total = parseNumberInput(amount)

  const recompute = (nextAmount: string, nextMode: SplitMode, nextWeights = weights) => {
    if (nextMode === 'amounts') return
    form.setFieldValue(
      'splits',
      distribute(
        parseNumberInput(nextAmount),
        members.map(m => ({ name: m.name, userId: m.id, weight: nextWeights[m.id] ?? 1 })),
        currency
      )
    )
  }

  const handleAmountChange = (value: string) => {
    const next = sanitizeNumberInput(value)
    form.setFieldValue('amount', next)
    // In "Amounts" mode the per-person values are typed by hand; keep them
    recompute(next, mode)
  }

  const handleModeChange = (value: string) => {
    const next = value as SplitMode
    Haptics.selectionAsync()
    setMode(next)

    if (next === 'amounts') {
      // Start from whatever the current split works out to, for everyone
      form.setFieldValue(
        'splits',
        members.map(m => ({
          name: m.name,
          userId: m.id,
          amount: splits.find(s => s.userId === m.id)?.amount ?? '',
        }))
      )
      return
    }

    // Equally and shares both start with everyone currently in the split at one share
    const included = new Set(
      splits.filter(s => parseNumberInput(s.amount) > 0 || !total).map(s => s.userId)
    )
    const nextWeights = Object.fromEntries(
      members.map(m => [m.id, included.size === 0 || included.has(m.id) ? 1 : 0])
    )
    setWeights(nextWeights)
    recompute(amount, next, nextWeights)
  }

  const updateWeight = (id: string, nextWeight: number) => {
    const nextWeights = { ...weights, [id]: Math.max(0, Math.min(99, nextWeight)) }
    if (members.every(m => (nextWeights[m.id] ?? 1) === 0)) {
      toast.warning('At least one person has to be in the split')
      return
    }
    Haptics.selectionAsync()
    setWeights(nextWeights)
    recompute(amount, mode, nextWeights)
  }

  // Seed the split once the group loads (new expense) or from the saved expense (edit)
  useEffect(() => {
    if (!group) return

    if (!data) {
      if (!form.getFieldValue('splits').length) {
        form.setFieldValue(
          'splits',
          members.map(({ name, id }) => ({ name, userId: id, amount: '' }))
        )
      }
      return
    }

    const saved = data.splits.map(({ amount, user }) => ({
      name: user.name,
      userId: user.id,
      amount: amount.toString(),
    }))
    const equal = allEqual(saved.map(s => +s.amount))

    form.reset({
      category: data.category ?? 'OTHER',
      description: data.description,
      amount: data.amount.toString(),
      paidBy: data.paidById,
      splits: equal
        ? saved
        : members.map(m => ({
            name: m.name,
            userId: m.id,
            amount: saved.find(s => s.userId === m.id)?.amount ?? '',
          })),
    })
    setMode(equal ? 'equally' : 'amounts')
    setWeights(
      Object.fromEntries(members.map(m => [m.id, saved.some(s => s.userId === m.id) ? 1 : 0]))
    )
  }, [data, group])

  const { progress } = useReanimatedKeyboardAnimation()
  const footerStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(progress.value, [0, 1], [16, 0]),
    paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom + 8, 0]),
  }))

  const splitSum = splits.reduce((acc, s) => acc + parseNumberInput(s.amount), 0)
  const peopleInSplit = splits.filter(s => parseNumberInput(s.amount) > 0).length
  const totalShares = members.reduce((acc, m) => acc + weightOf(m.id), 0)
  const summary =
    mode === 'amounts'
      ? `${formatAmount(splitSum, currency)} of ${formatAmount(total, currency)}`
      : mode === 'shares'
        ? `${totalShares} share${totalShares === 1 ? '' : 's'}`
        : peopleInSplit
          ? `${peopleInSplit} × ${formatAmount(total / peopleInSplit, currency)}`
          : ''
  const amountsOff = mode === 'amounts' && total > 0 && Math.abs(splitSum - total) > 0.009

  const amountFor = (id: string) => splits.find(s => s.userId === id)?.amount ?? ''

  return (
    <>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerClassName='px-4 pb-6 gap-6'
        keyboardDismissMode='interactive'
        bottomOffset={120}
      >
        <form.AppField
          name='amount'
          children={field => (
            <View className='items-center pt-4'>
              <SectionLabel>Amount</SectionLabel>
              <View className='mt-1 flex-row items-center justify-center gap-2'>
                <Text className='text-muted-foreground font-mono text-xl font-medium'>
                  {currency}
                </Text>
                <TextInput
                  accessibilityLabel='Amount'
                  inputMode='decimal'
                  placeholder='0.00'
                  value={field.state.value}
                  onChangeText={handleAmountChange}
                  autoFocus={!data}
                  className='text-foreground min-w-24 font-mono font-semibold tracking-tight'
                  // Font size without a line height and a fixed height: on iOS a tight line
                  // height draws the empty placeholder too high and it jumps when typing starts
                  style={{ fontSize: 48, height: 64, paddingVertical: 0 }}
                  placeholderTextColorClassName='accent-muted-foreground'
                />
              </View>
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive mt-1 text-sm'>
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
            </View>
          )}
        />

        <form.AppField
          name='description'
          children={field => (
            <View className='gap-1'>
              <field.Input
                accessibilityLabel='Description'
                placeholder='What was it for?'
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

        <form.AppField
          name='category'
          children={field => (
            <ToggleGroup
              type='single'
              variant='outline'
              value={field.state.value}
              onValueChange={value => {
                if (value) field.handleChange(value)
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='-mx-4'
                contentContainerClassName='gap-2 px-4'
              >
                {Object.entries(transactionCategories).map(([value, { label }]) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    variant='outline'
                    className='h-10 rounded-full px-3.5'
                    accessibilityLabel={label}
                  >
                    <CategoryGlyph category={value as TransactionCategory} iconClassName='size-4' />
                    <Text>{label}</Text>
                  </ToggleGroupItem>
                ))}
              </ScrollView>
            </ToggleGroup>
          )}
        />

        <form.AppField
          name='paidBy'
          children={field => (
            <View className='gap-2'>
              <SectionLabel>Paid by</SectionLabel>
              <ToggleGroup
                type='single'
                variant='outline'
                value={field.state.value}
                onValueChange={value => {
                  if (value) field.handleChange(value)
                }}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className='-mx-4'
                  contentContainerClassName='gap-2 px-4'
                >
                  {members.map(member => (
                    <ToggleGroupItem
                      key={member.id}
                      value={member.id}
                      variant='outline'
                      className='h-10 rounded-full pr-3.5 pl-1.5'
                    >
                      <InitialsAvatar
                        name={member.name}
                        className='size-7'
                        textClassName='text-[10px]'
                      />
                      <Text>{user.id === member.id ? 'You' : member.name.split(' ')[0]}</Text>
                    </ToggleGroupItem>
                  ))}
                </ScrollView>
              </ToggleGroup>
            </View>
          )}
        />

        <View className='gap-3'>
          <View className='flex-row items-center justify-between'>
            <SectionLabel>Split</SectionLabel>
            <Text
              className={cn(
                'font-mono text-sm',
                amountsOff ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {summary}
            </Text>
          </View>
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className='w-full'>
              <TabsTrigger value='equally'>
                <Text>Equally</Text>
              </TabsTrigger>
              <TabsTrigger value='amounts'>
                <Text>Amounts</Text>
              </TabsTrigger>
              <TabsTrigger value='shares'>
                <Text>Shares</Text>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card className='gap-0 px-4 py-1'>
            {members.map((member, index) => {
              const name = member.id === user.id ? 'You' : member.name.split(' ')[0]
              const included = weightOf(member.id) > 0
              const splitIndex = splits.findIndex(s => s.userId === member.id)

              return (
                <View key={member.id}>
                  {index > 0 && <Separator />}
                  <View className='min-h-14 flex-row items-center gap-3 py-2'>
                    <InitialsAvatar name={member.name} className='size-8' textClassName='text-xs' />
                    <Text className='flex-1 font-medium' numberOfLines={1}>
                      {name}
                    </Text>

                    {mode === 'equally' && (
                      <>
                        <Text className='text-muted-foreground font-mono text-sm'>
                          {included && total > 0 ? amountFor(member.id) : '–'}
                        </Text>
                        <Pressable
                          role='checkbox'
                          aria-checked={included}
                          accessibilityLabel={`Include ${name}`}
                          hitSlop={8}
                          onPress={() => updateWeight(member.id, included ? 0 : 1)}
                          className={cn(
                            'size-6 items-center justify-center rounded-md border-2',
                            included ? 'bg-primary border-primary' : 'border-muted-foreground/60'
                          )}
                        >
                          {included && (
                            <Icon as={CheckIcon} className='text-primary-foreground size-4' />
                          )}
                        </Pressable>
                      </>
                    )}

                    {mode === 'shares' && (
                      <>
                        <Text className='text-muted-foreground font-mono text-sm'>
                          {included && total > 0 ? amountFor(member.id) : '–'}
                        </Text>
                        <View className='flex-row items-center gap-1'>
                          <Button
                            size='icon'
                            variant='outline'
                            className='size-8'
                            accessibilityLabel={`One fewer share for ${name}`}
                            disabled={!included}
                            onPress={() => updateWeight(member.id, weightOf(member.id) - 1)}
                          >
                            <Icon as={MinusIcon} className='size-4' />
                          </Button>
                          <Text
                            className='w-6 text-center font-mono font-semibold'
                            accessibilityLabel={`${weightOf(member.id)} shares`}
                          >
                            {weightOf(member.id)}
                          </Text>
                          <Button
                            size='icon'
                            variant='outline'
                            className='size-8'
                            accessibilityLabel={`One more share for ${name}`}
                            onPress={() => updateWeight(member.id, weightOf(member.id) + 1)}
                          >
                            <Icon as={PlusIcon} className='size-4' />
                          </Button>
                        </View>
                      </>
                    )}

                    {mode === 'amounts' && splitIndex >= 0 && (
                      <form.AppField name={`splits[${splitIndex}].amount`}>
                        {field => (
                          <Input
                            accessibilityLabel={`Amount for ${name}`}
                            inputMode='decimal'
                            placeholder='0.00'
                            className='h-10 w-28 text-right font-mono'
                            value={field.state.value}
                            onChangeText={v => field.handleChange(sanitizeNumberInput(v))}
                          />
                        )}
                      </form.AppField>
                    )}
                  </View>
                </View>
              )
            })}
          </Card>

          {/* Mounted so the form-level split check has a field to report on */}
          <form.AppField
            name='splits'
            children={field =>
              field.state.meta.errors.length > 0 ? (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors[0]?.message}
                </Text>
              ) : null
            }
          />
        </View>
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
                <Text>{data ? 'Save changes' : 'Save expense'}</Text>
              )}
            </form.Button>
          </form.AppForm>
        </Animated.View>
      </KeyboardStickyView>
    </>
  )
}
