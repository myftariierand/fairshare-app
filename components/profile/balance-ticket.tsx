import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useCSSVariable } from 'uniwind'

import { formatAmount } from '@/lib/utils'

import type { Group } from '@/types/common'

import { ScaleIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Empty } from '@/components/ui/empty'

export default function BalanceTicket({
  currentUserId,
  transactions,
}: {
  currentUserId: string
  transactions: Group['transactions']
}) {
  const cardColor = useCSSVariable('--color-card') as string

  const balancesByCurrency = computeBalancesByCurrency(currentUserId, transactions)
  const currencies = Object.keys(balancesByCurrency)

  return (
    <View className='relative'>
      <Card className='rounded-b-none border-b-0 py-0'>
        {!currencies.length ? (
          <Empty
            title='No Balance Activity'
            description="We couldn't generate a balance from your activity at this moment."
            icon={ScaleIcon}
            containerClassName='mt-6 mb-4'
          />
        ) : (
          <CardContent className='flex flex-wrap justify-between gap-4 p-6 pb-5'>
            {currencies.map((currency, index) => {
              const { net, owedToYou, youOwe } = balancesByCurrency[currency]
              const positive = net >= 0

              return (
                <View key={currency}>
                  <View className='flex flex-wrap justify-between gap-4'>
                    <View>
                      <View
                        className='font-mono text-[10px] uppercase'
                        style={
                          {
                            // letterSpacing: '0.14em',
                          }
                        }
                      >
                        <Text>Net balance · {currency}</Text>
                      </View>
                      <View className='mt-1.5 leading-none font-semibold'>
                        <Text>{formatAmount(net, currency)}</Text>
                      </View>
                      <Text className='mt-2 text-xs'>
                        {positive
                          ? "You're owed more than you owe in this currency"
                          : "You owe more than you're owed in this currency"}
                      </Text>
                    </View>
                    <View className='flex-row gap-2 space-y-1 font-mono text-xs'>
                      <View>
                        <Text>owed to you </Text>
                        <Text className='text-owed'>{formatAmount(owedToYou, currency)}</Text>
                      </View>
                      <View>
                        <Text>you owe </Text>
                        <Text className='text-owe'>{formatAmount(youOwe, currency)}</Text>
                      </View>
                    </View>
                  </View>
                  {index < currencies.length - 1 && <Separator />}
                </View>
              )
            })}
          </CardContent>
        )}
      </Card>
      <TornEdge color={cardColor} />
    </View>
  )
}

function TornEdge({
  color,
  height = 20,
  teeth = 26,
}: {
  color: string
  height?: number
  teeth?: number
}) {
  const step = 100 / teeth
  let d = `M0 0 H100 V${height * 0.5}`
  for (let i = teeth; i >= 0; i--) {
    // alternate with a little irregularity so it looks torn, not zigzag
    const y = i % 2 ? height : height * (0.2 + ((i * 37) % 10) / 25)
    d += ` L${i * step} ${y}`
  }
  d += ' Z'

  return (
    <Svg
      width='100%'
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio='none'
      className='fill-card'
    >
      <Path d={d} fill={color} />
    </Svg>
  )
}

function computeBalances(currentUserId: string, transactions: Group['transactions']): Balances {
  const pairwise: Record<string, number> = {}

  for (const txn of transactions) {
    const { paidById, splits } = txn

    for (const split of splits) {
      if (split.userId === paidById) continue // payer's own share isn't a debt

      const amount = Number(split.amount)

      if (paidById === currentUserId) {
        // split.userId owes me `amount` (or, for a settlement recorded as
        // a reverse entry, this cancels what I previously owed them).
        pairwise[split.userId] = (pairwise[split.userId] ?? 0) + amount
      } else if (split.userId === currentUserId) {
        // I owe paidById `amount` (or this cancels what they owed me).
        pairwise[paidById] = (pairwise[paidById] ?? 0) - amount
      }
    }
  }

  let owedToYou = 0
  let youOwe = 0
  for (const amount of Object.values(pairwise)) {
    if (amount > 0) owedToYou += amount
    else youOwe += Math.abs(amount)
  }

  return {
    net: owedToYou - youOwe,
    owedToYou,
    youOwe,
    pairwise,
  }
}
interface Balances {
  net: number
  owedToYou: number
  youOwe: number
  pairwise: Record<string, number> // otherUserId -> amount they owe you (negative = you owe them)
}

function computeBalancesByCurrency(
  currentUserId: string,
  transactions: Group['transactions']
): Record<string, Balances> {
  const byCurrency: Record<string, Group['transactions']> = {}
  for (const txn of transactions) {
    const currency = txn.group.currency
    ;(byCurrency[currency] ??= []).push(txn)
  }

  const result: Record<string, Balances> = {}
  for (const [currency, txns] of Object.entries(byCurrency)) {
    result[currency] = computeBalances(currentUserId, txns)
  }
  return result
}
