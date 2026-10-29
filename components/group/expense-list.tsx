import { Pressable, SectionList, View } from 'react-native'
import { Link } from 'expo-router'
import { format, isSameYear } from 'date-fns'

import { useAuthUser } from '@/lib/auth-context'
import { formatAmount } from '@/lib/utils'

import type { Transaction } from '@/types/group'
import { TransactionType } from '@/types/group'

import { CheckIcon, ReceiptTextIcon } from 'lucide-react-native'

import { Amount } from '@/components/ui/amount'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useMemo } from 'react'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { Empty } from '@/components/ui/empty'
import { SectionLabel } from '@/components/ui/section-label'
import { CategoryIcon } from '@/components/category-icon'

type Section = { title: string; data: Transaction[] }

export default function TransactionList({
  transactions,
  currency,
}: {
  transactions: Transaction[]
  currency: string
}) {
  const user = useAuthUser()
  const { groupId } = useGroupIdParam()
  const sections = useMemo<Section[]>(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const groups = new Map<string, Section>()
    const now = new Date()

    for (const t of sorted) {
      const date = new Date(t.createdAt)
      const key = format(date, 'yyyy-MM-dd') // unique per day, includes year

      if (!groups.has(key)) {
        groups.set(key, {
          title: format(date, isSameYear(date, now) ? 'EEE, d MMM' : 'EEE, d MMM yyyy'),
          data: [],
        })
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
      contentContainerClassName='pb-24'
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Empty
          title='No expenses yet'
          icon={ReceiptTextIcon}
          description='Add the first one and FairShare works out who owes whom.'
        />
      }
      renderSectionHeader={({ section }) => (
        <SectionLabel className='bg-background pt-3 pb-1'>{section.title}</SectionLabel>
      )}
      renderItem={({ item: transaction }) => {
        if (transaction.type !== TransactionType.expense) {
          return (
            <View className='bg-owed/10 my-1 flex-row items-center gap-2 self-start rounded-full py-1.5 pr-3 pl-2'>
              <Icon as={CheckIcon} className='text-owed size-4' />
              <Text className='text-sm font-medium'>{transaction.description}</Text>
            </View>
          )
        }

        const payer =
          transaction.paidBy.id === user.id ? 'You' : transaction.paidBy.name.split(' ')[0]
        const { balance } = transaction

        return (
          <Link asChild href={`/groups/${groupId}/expenses/${transaction.id}`}>
            <Pressable
              className='flex-row items-center gap-3 py-2.5 active:opacity-70'
              accessibilityLabel={`${transaction.description}, ${payer} paid ${formatAmount(transaction.amount, currency)}`}
            >
              <CategoryIcon category={transaction.category} />
              <View className='flex-1'>
                <Text className='font-semibold' numberOfLines={1}>
                  {transaction.description}
                </Text>
                <Text className='text-muted-foreground mt-0.5 text-sm' numberOfLines={1}>
                  <Text className='text-foreground text-sm font-medium'>{payer}</Text> paid{' '}
                  {formatAmount(transaction.amount, currency)}
                </Text>
              </View>
              <View className='items-end'>
                <Text className='text-muted-foreground text-xs'>
                  {balance < 0 ? 'you owe' : balance === 0 ? 'not involved' : 'you lent'}
                </Text>
                {balance !== 0 && (
                  <Amount
                    value={balance}
                    currency={currency}
                    tone='balance'
                    className='text-sm font-semibold'
                  />
                )}
              </View>
            </Pressable>
          </Link>
        )
      }}
    />
  )
}
