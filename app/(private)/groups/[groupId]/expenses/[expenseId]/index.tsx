import { ActivityIndicator, ScrollView, View } from 'react-native'
import { Link, router, Stack, useLocalSearchParams } from 'expo-router'
import { format } from 'date-fns'

import { useGetGroupById, useGetExpenseById } from '@/services/group'
import { useAuthUser } from '@/lib/auth-context'
import { transactionCategories } from '@/lib/utils'

import { PencilIcon, ReceiptTextIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Amount, SETTLED_EPSILON } from '@/components/ui/amount'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/ui/icon-tile'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { CategoryIcon } from '@/components/category-icon'
import { DeleteExpenseDialog } from '@/components/group/delete-expense-dialog'
import { headerRightOptions, useCenteredHeader } from '@/components/header-button'

export default function ExpenseScreen() {
  const user = useAuthUser()
  const headerOptions = useCenteredHeader('Expense')
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId: string }>()
  const {
    data: group,
    isPending: isPendingGroup,
    isError: isErrorGroup,
    error: errorGroup,
    refetch: refetchGroup,
  } = useGetGroupById(groupId)
  const { data: expense, isPending, isError, error, refetch } = useGetExpenseById(expenseId)

  if (isPending || isPendingGroup) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator />
        </View>
      </>
    )
  }

  if (isError || isErrorGroup) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View className='flex-1 items-center justify-center gap-4 p-6'>
          <Text className='text-destructive text-center'>
            {errorGroup?.message || error?.message}
          </Text>
          <Button
            onPress={() => {
              if (isError) refetch()
              if (isErrorGroup) refetchGroup()
            }}
          >
            <Text>Try again</Text>
          </Button>
          <Button variant='ghost' onPress={() => router.back()}>
            <Text>Go back</Text>
          </Button>
        </View>
      </>
    )
  }

  const currency = group.currency
  const firstName = (id: string, name: string) => (id === user.id ? 'You' : name.split(' ')[0])
  const category = expense.category ? transactionCategories[expense.category] : null

  // Your position on this expense: what you paid minus your own share
  const yourShare = expense.splits.find(s => s.userId === user.id)?.amount ?? 0
  const youPaid = expense.paidById === user.id ? expense.amount : 0
  const yourNet = youPaid - yourShare
  const involved = youPaid > 0 || yourShare > 0

  // Payer first, then everyone else by amount
  const splits = [...expense.splits].sort((a, b) =>
    a.userId === expense.paidById ? -1 : b.userId === expense.paidById ? 1 : b.amount - a.amount
  )

  return (
    <>
      <Stack.Screen
        options={{
          ...headerOptions,
          ...headerRightOptions(
            <View className='flex-row gap-2'>
              <Link asChild href={`/groups/${groupId}/expenses/${expenseId}/edit`}>
                <Button size='icon' variant='outline' accessibilityLabel='Edit expense'>
                  <Icon as={PencilIcon} className='size-4' />
                </Button>
              </Link>
              <DeleteExpenseDialog expense={expense} groupId={groupId} />
            </View>
          ),
        }}
      />
      <ScrollView contentContainerClassName='gap-5 px-5 pt-4 pb-12'>
        <View className='items-center gap-3 py-2'>
          {expense.category ? (
            <CategoryIcon category={expense.category} className='size-16 rounded-xl' />
          ) : (
            <IconTile as={ReceiptTextIcon} className='size-16 rounded-xl' />
          )}
          <Text className='text-center text-2xl font-bold tracking-tight'>
            {expense.description}
          </Text>
          <Amount
            value={expense.amount}
            currency={currency}
            className='text-4xl font-semibold tracking-tight'
            adjustsFontSizeToFit
            numberOfLines={1}
          />
          <Text className='text-muted-foreground text-sm'>
            {category ? `${category.label} · ` : ''}
            {format(expense.createdAt, 'EEE, d MMM yyyy')}
          </Text>
        </View>

        <Card className='flex-row items-center justify-between gap-3 px-4 py-4'>
          <Text className='text-muted-foreground'>
            {!involved
              ? "You're not part of this expense"
              : Math.abs(yourNet) <= SETTLED_EPSILON
                ? 'You paid your own share'
                : yourNet > 0
                  ? 'You lent'
                  : 'You owe'}
          </Text>
          {involved && Math.abs(yourNet) > SETTLED_EPSILON && (
            <Amount
              value={yourNet}
              currency={currency}
              tone='balance'
              className='text-lg font-semibold'
            />
          )}
        </Card>

        <View className='gap-2'>
          <SectionLabel>Split between {expense.splits.length}</SectionLabel>
          <Card className='gap-0 px-4 py-0'>
            {splits.map((split, index) => {
              const isPayer = split.userId === expense.paidById
              return (
                <View key={split.id}>
                  {index > 0 && <Separator />}
                  <View className='min-h-16 flex-row items-center gap-3 py-2'>
                    <InitialsAvatar name={split.user.name} className='size-10' />
                    <View className='flex-1'>
                      <Text className='font-semibold' numberOfLines={1}>
                        {firstName(split.userId, split.user.name)}
                      </Text>
                      {isPayer && (
                        <Text className='text-muted-foreground text-sm'>
                          Paid{' '}
                          <Amount value={expense.amount} currency={currency} className='text-sm' />
                        </Text>
                      )}
                    </View>
                    <Amount value={split.amount} currency={currency} className='font-semibold' />
                  </View>
                </View>
              )
            })}
            {/* The payer isn't always in the split: they can pay for others only */}
            {!expense.splits.some(s => s.userId === expense.paidById) && (
              <View>
                <Separator />
                <View className='min-h-16 flex-row items-center gap-3 py-2'>
                  <InitialsAvatar name={expense.paidBy.name} className='size-10' />
                  <View className='flex-1'>
                    <Text className='font-semibold' numberOfLines={1}>
                      {firstName(expense.paidById, expense.paidBy.name)}
                    </Text>
                    <Text className='text-muted-foreground text-sm'>
                      Paid <Amount value={expense.amount} currency={currency} className='text-sm' />
                    </Text>
                  </View>
                  <Text className='text-muted-foreground text-sm'>Not in the split</Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        <Text className='text-muted-foreground text-center text-sm'>
          Added by {firstName(expense.createdBy.id, expense.createdBy.name)} ·{' '}
          {format(expense.createdAt, 'd MMM yyyy, HH:mm')}
        </Text>
      </ScrollView>
    </>
  )
}
