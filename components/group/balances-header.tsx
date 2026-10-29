import { View } from 'react-native'

import { useAuthUser } from '@/lib/auth-context'

import { formatAmount } from '@/lib/utils'

import { TransactionType } from '@/types/group'
import type { Member, Transaction } from '@/types/group'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function BalancesHeader({
  transactions,
  members,
  currency,
}: {
  transactions: Transaction[]
  members: Member[]
  currency: string
}) {
  const user = useAuthUser()

  const total = transactions
    .filter(transaction => transaction.type === TransactionType.expense)
    .reduce((acc, curr) => acc + +curr.amount, 0)

  const userShare = transactions
    .filter(
      transaction =>
        transaction.type === TransactionType.expense &&
        transaction.splits.some(split => split.userId === user.id)
    )
    .flatMap(transaction => transaction.splits)
    .filter(split => split.userId === user.id)
    .reduce((acc, split) => acc + split.amount, 0)

  function getGroupBalances() {
    // Initialize balance map at 0 for every member
    const balances = new Map<string, number>()
    for (const member of members) {
      balances.set(member.id, 0)
    }

    for (const tx of transactions) {
      const amount = Number(tx.amount)

      // Payer is credited the full amount they fronted
      balances.set(tx.paidBy.id, (balances.get(tx.paidBy.id) ?? 0) + amount)

      // Each split participant is debited their share
      for (const split of tx.splits) {
        const splitAmount = Number(split.amount)
        balances.set(split.userId, (balances.get(split.userId) ?? 0) - splitAmount)
      }
    }

    return members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      balance: Math.round((balances.get(member.id) ?? 0) * 100) / 100,
    }))
  }

  return (
    <View className='gap-2'>
      <View className='flex-row gap-2'>
        <Card className='flex-1 py-4'>
          <CardHeader className='px-3'>
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className='text-md'>{formatAmount(total, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='flex-1 py-4'>
          <CardHeader className='px-3'>
            <CardDescription>Your Share</CardDescription>
            <CardTitle className='text-md'>{formatAmount(userShare, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='py-4'>
          <CardHeader className='px-3'>
            <CardDescription>Expenses</CardDescription>
            <CardTitle className='text-md'>{transactions.length}</CardTitle>
          </CardHeader>
        </Card>
      </View>
      <Card className='flex-row flex-wrap gap-2 p-4'>
        {getGroupBalances().map(({ id, name, balance }) => {
          return (
            <View key={id} className='flex-row items-center gap-2'>
              <Avatar className='size-8' alt='member avatar'>
                <AvatarFallback className='border-border border'>
                  <Text variant={'muted'} className='text-xs'>
                    {name.slice(0, 2)}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View>
                <Text className='text-foreground text-sm leading-none'>{name.split(' ')[0]}</Text>
                <Text
                  className={`mt-0.5 font-mono text-xs font-bold whitespace-nowrap ${balance > 0.01 ? 'text-owed' : balance < -0.01 ? 'text-owe' : 'text-muted-foreground'}`}
                >
                  {formatAmount(Math.abs(balance), currency)}
                </Text>
              </View>
            </View>
          )
        })}
      </Card>
    </View>
  )
}
