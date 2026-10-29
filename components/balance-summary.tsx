import { useMemo } from 'react'
import { View } from 'react-native'
import { ArrowDownLeftIcon, ArrowUpRightIcon } from 'lucide-react-native'

import { computeBalancesByCurrency } from '@/lib/balances'
import type { Group } from '@/types/common'

import { Amount, SETTLED_EPSILON } from '@/components/ui/amount'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

// What you're owed vs. what you owe, one block per currency
export function BalanceSummary({
  userId,
  transactions,
}: {
  userId: string
  transactions: Group['transactions']
}) {
  const byCurrency = useMemo(
    () => computeBalancesByCurrency(userId, transactions),
    [userId, transactions]
  )
  const currencies = Object.keys(byCurrency)

  if (!currencies.length) {
    return (
      <Card className='gap-1 p-5'>
        <SectionLabel>Balance</SectionLabel>
        <Text className='text-muted-foreground'>
          No balances yet. Add an expense to a group to get started.
        </Text>
      </Card>
    )
  }

  return (
    <Card className='gap-0 p-5'>
      {currencies.map((currency, index) => {
        const { net, owedToYou, youOwe } = byCurrency[currency]
        const total = owedToYou + youOwe
        const status =
          Math.abs(net) <= SETTLED_EPSILON ? 'All square' : net > 0 ? "You're owed" : 'You owe'

        return (
          <View key={currency}>
            {index > 0 && <Separator className='my-5' />}
            <View className='flex-row items-center justify-between'>
              <SectionLabel>Net balance · {currency}</SectionLabel>
              <View className='bg-secondary rounded-full px-2.5 py-1'>
                <Text className='text-muted-foreground text-xs font-semibold'>{status}</Text>
              </View>
            </View>
            <Amount
              value={net}
              currency={currency}
              tone='balance'
              signed
              className='mt-2 text-3xl font-semibold tracking-tight'
            />

            <View className='mt-4 flex-row gap-4'>
              <View className='flex-1'>
                <View className='flex-row items-center gap-1'>
                  <Icon as={ArrowDownLeftIcon} className='text-owed size-3.5' />
                  <Text className='text-muted-foreground text-sm'>Owed to you</Text>
                </View>
                <Amount
                  value={owedToYou}
                  currency={currency}
                  className='text-owed mt-0.5 text-base font-semibold'
                />
              </View>
              <View className='flex-1'>
                <View className='flex-row items-center gap-1'>
                  <Icon as={ArrowUpRightIcon} className='text-owe size-3.5' />
                  <Text className='text-muted-foreground text-sm'>You owe</Text>
                </View>
                <Amount
                  value={youOwe}
                  currency={currency}
                  className='text-owe mt-0.5 text-base font-semibold'
                />
              </View>
            </View>

            {total > SETTLED_EPSILON && (
              <View className='mt-4 h-1.5 flex-row gap-1 overflow-hidden rounded-full'>
                {owedToYou > 0 && (
                  <View className='bg-owed rounded-full' style={{ flex: owedToYou }} />
                )}
                {youOwe > 0 && <View className='bg-owe rounded-full' style={{ flex: youOwe }} />}
              </View>
            )}
          </View>
        )
      })}
    </Card>
  )
}
