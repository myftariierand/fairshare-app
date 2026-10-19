import { ActivityIndicator, View } from 'react-native'
import { Link, router, Stack, useLocalSearchParams } from 'expo-router'

import { useGetGroupById, useGetExpenseById } from '@/services/group'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/utils'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthUser } from '@/lib/auth-context'
import { Icon } from '@/components/ui/icon'
import { PencilIcon, TrashIcon } from 'lucide-react-native'
import { DeleteExpenseDialog } from '@/components/group/delete-expense-dialog'

export default function ExpenseScreen() {
  const user = useAuthUser()
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
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator />
        </View>
      </>
    )
  }

  if (isError || isErrorGroup) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center gap-4 p-6'>
          <Text className='text-destructive'>{errorGroup?.message || error?.message}</Text>
          <Button onPress={() => (isError ? refetch() : isErrorGroup ? refetchGroup : () => {})}>
            <Text>Try again</Text>
          </Button>
          <Button variant={'link'} onPress={() => router.back()}>
            <Text>Go Back</Text>
          </Button>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: expense.description,
          headerRight: () => (
            <>
              <Link asChild href={`/groups/${groupId}/expenses/${expenseId}/edit`}>
                <Button className='mr-2'>
                  <Icon as={PencilIcon} />
                  <Text>Edit</Text>
                </Button>
              </Link>
              <DeleteExpenseDialog expense={expense} groupId={groupId} />
            </>
          ),
        }}
      />
      <View className='p-4'>
        <Text variant={'h3'} className='text-3xl font-bold'>
          {formatAmount(expense.amount, group?.currency)}
        </Text>
        <View className='text-muted-foreground flex-row'>
          <Text className='text-muted-foreground'>Added by </Text>
          <Text className='text-foreground font-medium'>
            {expense.createdBy.name.split(' ')[0]}
          </Text>
          <Text className='text-muted-foreground'> on </Text>
          <Text className='text-foreground font-medium whitespace-nowrap'>
            {format(expense.createdAt, 'dd MMMM yyyy, HH:mm')}
          </Text>
        </View>
        <Separator className='my-4' />
        <View className='mb-4 flex-row items-center gap-3'>
          <Avatar className='size-7' alt='user image'>
            <AvatarFallback className='border-border border'>
              <Text variant={'muted'}>{expense.paidBy.name.slice(0, 2)}</Text>
            </AvatarFallback>
          </Avatar>
          <View className='text-muted-foreground flex-row'>
            <Text className='text-foreground font-medium'>
              {expense.paidById === user.id ? 'You' : expense.paidBy.name.split(' ')[0]}{' '}
            </Text>
            <Text>paid </Text>
            <Text className='text-foreground font-medium'>
              {formatAmount(expense.amount, group.currency)}
            </Text>
          </View>
        </View>
        <View className='gap-4 pl-9'>
          {expense.splits
            .filter(split => expense.paidById !== split.userId)
            .map(split => (
              <View key={split.id} className='flex-row items-center gap-3'>
                <Avatar className='size-7' alt='user iamge'>
                  <AvatarFallback className='border-border border'>
                    <Text variant={'muted'}>{split.user.name.slice(0, 2)}</Text>
                  </AvatarFallback>
                </Avatar>
                <View className='text-muted-foreground flex-row'>
                  <Text className='text-foreground font-medium'>
                    {split.userId === user.id ? 'You' : split.user.name.split(' ')[0]}
                  </Text>
                  <Text> {split.userId === user.id ? 'owe' : 'owes'} </Text>
                  <Text className='text-foreground font-medium'>
                    {formatAmount(split.amount, group.currency)}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </>
  )
}
