import { differenceInCalendarMonths, format, startOfMonth, subMonths } from 'date-fns'

import { TransactionType } from '@/types/group'
import type { Group } from '@/types/common'

const MONTHS = 6

export type MonthlyStats = {
  currency: string
  /** Your share of expenses this month */
  spent: number
  /** Change vs last month as a fraction, or null when last month was empty */
  change: number | null
  expenses: number
  groups: number
  topCategory: { category: string; share: number } | null
  topPartner: { name: string; count: number } | null
  /** Oldest first, the current month last */
  months: { label: string; total: number }[]
}

// What you spent, as your share of each expense, over the last few months. Amounts
// in different currencies can't be added, so it uses the currency you split most in.
export function computeMonthlyStats(
  userId: string,
  groups: Group[],
  now = new Date()
): MonthlyStats | null {
  const shares = groups.flatMap(group =>
    group.transactions.flatMap(tx => {
      if (tx.type !== TransactionType.expense) return []
      const split = tx.splits.find(s => s.userId === userId)
      if (!split) return []
      return [
        {
          amount: Number(split.amount),
          monthsAgo: differenceInCalendarMonths(now, tx.createdAt),
          category: tx.category as string,
          currency: group.currency,
          groupId: group.id,
          others: tx.splits.map(s => s.userId).filter(id => id !== userId),
        },
      ]
    })
  )
  if (!shares.length) return null

  const perCurrency = countBy(shares.map(s => s.currency))
  const currency = topKey(perCurrency)!
  const inCurrency = shares.filter(s => s.currency === currency)

  const months = Array.from({ length: MONTHS }, (_, i) => ({
    label: format(startOfMonth(subMonths(now, MONTHS - 1 - i)), 'MMM'),
    total: 0,
  }))
  for (const share of inCurrency) {
    if (share.monthsAgo >= 0 && share.monthsAgo < MONTHS) {
      months[MONTHS - 1 - share.monthsAgo].total += share.amount
    }
  }

  const thisMonth = inCurrency.filter(s => s.monthsAgo === 0)
  const spent = months[MONTHS - 1].total
  const lastMonth = months[MONTHS - 2].total

  const byCategory: Record<string, number> = {}
  for (const share of thisMonth) {
    byCategory[share.category] = (byCategory[share.category] ?? 0) + share.amount
  }
  const category = topKey(byCategory)

  const partnerId = topKey(countBy(thisMonth.flatMap(s => s.others)))
  const partnerName = partnerId
    ? groups.flatMap(g => g.members).find(member => member.id === partnerId)?.name
    : undefined

  return {
    currency,
    spent,
    change: lastMonth > 0 ? (spent - lastMonth) / lastMonth : null,
    expenses: thisMonth.length,
    groups: new Set(thisMonth.map(s => s.groupId)).size,
    topCategory: category && spent > 0 ? { category, share: byCategory[category] / spent } : null,
    topPartner:
      partnerId && partnerName
        ? { name: partnerName, count: thisMonth.filter(s => s.others.includes(partnerId)).length }
        : null,
    months,
  }
}

function countBy(keys: string[]) {
  const counts: Record<string, number> = {}
  for (const key of keys) counts[key] = (counts[key] ?? 0) + 1
  return counts
}

function topKey(values: Record<string, number>) {
  let best: string | undefined
  for (const key in values) if (best === undefined || values[key] > values[best]) best = key
  return best
}
