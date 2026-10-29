import { View } from 'react-native'

import { useAuthUser } from '@/lib/auth-context'
import { computeGroupMemberBalances } from '@/lib/balances'
import { transactionCategories } from '@/lib/utils'

import type { Member, Transaction, TransactionCategory } from '@/types/group'
import { TransactionType } from '@/types/group'

import { Text } from '@/components/ui/text'
import { Amount } from '@/components/ui/amount'
import { Card } from '@/components/ui/card'
import { ScaleIcon } from 'lucide-react-native'
import { Empty } from '@/components/ui/empty'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { CategoryIcon } from '@/components/category-icon'

export default function BalanceTab({
  transactions = [],
  members = [],
  currency = 'USD',
}: {
  transactions: Transaction[]
  members: Member[]
  currency: string
}) {
  const user = useAuthUser()
  const memberBalances = computeGroupMemberBalances(members, transactions)

  const grouped = transactions
    .filter(t => t.type === TransactionType.expense)
    .reduce<Partial<Record<TransactionCategory, typeof transactions>>>((acc, curr) => {
      const key = curr.category

      if (!acc[key]) acc[key] = []
      acc[key].push(curr)

      return acc
    }, {})

  const totalExpenses = transactions.reduce(
    (acc, curr) => acc + (curr.type === TransactionType.expense ? curr.amount : 0),
    0
  )

  // Biggest categories first
  const entries = (Object.entries(grouped) as Array<[TransactionCategory, typeof transactions]>)
    .map(([key, txns]) => [key, txns.reduce((acc, curr) => acc + curr.amount, 0)] as const)
    .sort((a, b) => b[1] - a[1])

  return (
    <View className='gap-5'>
      <View className='gap-3'>
        <SectionLabel>Members</SectionLabel>
        <View className='flex-row flex-wrap gap-y-4'>
          {memberBalances.map(({ id, name, balance }) => (
            <View key={id} className='w-1/4 items-center gap-1.5'>
              <InitialsAvatar name={name} className='size-11' />
              <Text className='text-sm font-medium' numberOfLines={1}>
                {id === user.id ? 'You' : name.split(' ')[0]}
              </Text>
              <Amount
                value={balance}
                currency={currency}
                tone='balance'
                signed
                className='text-xs'
                numberOfLines={1}
              />
            </View>
          ))}
        </View>
      </View>

      {!entries.length ? (
        <Empty
          title='No spending yet'
          icon={ScaleIcon}
          description='Category totals show up here once the group has expenses.'
        />
      ) : (
        <Card className='gap-4 p-5'>
          <View className='flex-row items-baseline justify-between'>
            <Text className='font-semibold'>Spending by category</Text>
            <Amount
              value={totalExpenses}
              currency={currency}
              className='text-muted-foreground text-sm'
            />
          </View>
          {entries.map(([key, total]) => {
            const share = totalExpenses ? total / totalExpenses : 0
            return (
              <View key={key} className='flex-row items-center gap-3'>
                <CategoryIcon category={key} />
                <View className='flex-1'>
                  <View className='flex-row justify-between gap-2'>
                    <Text className='flex-1' numberOfLines={1}>
                      {transactionCategories[key].label}
                    </Text>
                    <Amount value={total} currency={currency} className='text-sm' />
                  </View>
                  <View className='bg-border mt-1.5 h-1.5 overflow-hidden rounded-full'>
                    <View
                      className='bg-primary h-full rounded-full'
                      style={{ width: `${Math.max(share * 100, 1)}%` }}
                    />
                  </View>
                </View>
                <Text className='text-muted-foreground w-10 text-right text-xs'>
                  {Math.round(share * 100)}%
                </Text>
              </View>
            )
          })}
        </Card>
      )}
    </View>
  )
}
