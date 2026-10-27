import { Pressable, SectionList, View } from 'react-native'
import { Link } from 'expo-router'
import { format } from 'date-fns'

import { cn, formatAmount, transactionCategories } from '@/lib/utils'

import type { Transaction } from '@/types/group'
import { TransactionType } from '@/types/group'

import { DotIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useMemo } from 'react'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { Empty } from '@/components/ui/empty'

type Section = { title: string; data: Transaction[] }

export default function TransactionList({
  transactions,
  currency,
}: {
  transactions: Transaction[]
  currency: string
}) {
  const { groupId } = useGroupIdParam()
  const sections = useMemo<Section[]>(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const groups = new Map<string, Section>()

    for (const t of sorted) {
      const date = new Date(t.createdAt)
      const key = format(date, 'yyyy-MM-dd') // unique per day, includes year

      if (!groups.has(key)) {
        groups.set(key, { title: format(date, 'EEEE, dd MMM'), data: [] })
      }
      groups.get(key)!.data.push(t)
    }

    return Array.from(groups.values())
  }, [transactions])

  return (
    <SectionList
      sections={sections}
      keyExtractor={t => t.id}
      className='flex-1'
      stickySectionHeadersEnabled
      ListEmptyComponent={
        <Empty
          title='No Expenses'
          description='None of the members has added any expenses to the group yet.'
        />
      }
      renderSectionHeader={({ section }) => (
        <View className={'bg-background pb-2'}>
          <Text className='text-muted-foreground text-xs font-semibold uppercase'>
            {section.title}
          </Text>
        </View>
      )}
      renderItem={({ item: transaction }) =>
        transaction.type === TransactionType.expense ? (
          <Link asChild href={`/groups/${groupId}/expenses/${transaction.id}`}>
            <Pressable className='mb-2 w-full flex-row items-center gap-3'>
              <View className='bg-secondary size-8 shrink-0 items-center justify-center rounded'>
                <Text>{transactionCategories[transaction.category].emoji}</Text>
              </View>
              <View className='flex-1 overflow-hidden text-ellipsis'>
                <Text className='overflow-hidden font-semibold text-ellipsis whitespace-nowrap'>
                  {transaction.description}
                </Text>
                <View className='flex-row items-center text-wrap whitespace-nowrap'>
                  <Text className='text-foreground text-xs font-semibold'>
                    {transaction.paidBy.name.split(' ')[0]}
                  </Text>
                  <Text className='text-muted-foreground text-xs'> paid</Text>
                  <Icon as={DotIcon} className='text-muted-foreground' />
                  <Text className='text-muted-foreground text-xs'>
                    {formatAmount(transaction.amount, currency)}
                  </Text>
                  <Icon as={DotIcon} className='text-muted-foreground' />
                  <Text className='text-muted-foreground text-xs'>
                    {transactionCategories[transaction.category].label}
                  </Text>
                </View>
              </View>
              <View className='flex flex-col items-end'>
                <Text className='text-muted-foreground text-xs'>
                  {transaction.balance < 0
                    ? 'You borrowed'
                    : transaction.balance === 0
                      ? 'Not Involved'
                      : 'You lent'}
                </Text>
                {transaction.balance !== 0 && (
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      transaction.balance < 0
                        ? 'text-destructive'
                        : transaction.balance === 0
                          ? ''
                          : 'text-success'
                    )}
                  >
                    {formatAmount(Math.abs(transaction.balance), currency)}
                  </Text>
                )}
              </View>
            </Pressable>
          </Link>
        ) : (
          <View className='p-2'>
            <Text className='text-muted-foreground text-center text-sm font-medium'>
              {transaction.description}
            </Text>
          </View>
        )
      }
    />
  )
}
