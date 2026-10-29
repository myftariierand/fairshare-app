import { View } from 'react-native'

import { useAuthUser } from '@/lib/auth-context'
import { computeGroupMemberBalances } from '@/lib/balances'

import { TransactionType } from '@/types/group'
import type { Member, Transaction } from '@/types/group'

import { Amount } from '@/components/ui/amount'
import { BalanceChip } from '@/components/ui/balance-chip'
import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'

// Total spent, your share and where you stand, in one strip
export default function GroupSummary({
  transactions,
  members,
  currency,
}: {
  transactions: Transaction[]
  members: Member[]
  currency: string
}) {
  const user = useAuthUser()

  const expenses = transactions.filter(t => t.type === TransactionType.expense)
  const total = expenses.reduce((acc, curr) => acc + +curr.amount, 0)
  const userShare = expenses
    .flatMap(t => t.splits)
    .filter(split => split.userId === user.id)
    .reduce((acc, split) => acc + +split.amount, 0)
  const yourBalance =
    computeGroupMemberBalances(members, transactions).find(m => m.id === user.id)?.balance ?? 0

  return (
    // Total gets its own row so large amounts never truncate; share and balance sit below
    <Card className='gap-0 p-0'>
      <View className='gap-1 px-4 pt-4 pb-3'>
        <SectionLabel>Total spent</SectionLabel>
        <Amount
          value={total}
          currency={currency}
          className='text-2xl font-semibold tracking-tight'
          adjustsFontSizeToFit
          numberOfLines={1}
        />
      </View>
      <Separator />
      <View className='flex-row'>
        <View className='flex-1 gap-1 px-4 py-3'>
          <SectionLabel>Your share</SectionLabel>
          <Amount value={userShare} currency={currency} className='font-semibold' />
        </View>
        <View className='bg-border w-px' />
        <View className='flex-1 items-start gap-1 px-4 py-3'>
          <SectionLabel>You</SectionLabel>
          <BalanceChip value={yourBalance} currency={currency} className='-ml-0.5' />
        </View>
      </View>
    </Card>
  )
}
