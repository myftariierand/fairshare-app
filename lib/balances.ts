import type { Group } from '@/types/common'

// Net balances for the current user across transactions, from each pair of people.
// Shared by the profile and groups summaries.
export function computeBalances(
  currentUserId: string,
  transactions: Group['transactions']
): Balances {
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
export interface Balances {
  net: number
  owedToYou: number
  youOwe: number
  pairwise: Record<string, number> // otherUserId -> amount they owe you (negative = you owe them)
}

export function computeBalancesByCurrency(
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

// Net position of every member within one group: what they paid minus their shares.
// Positive = the group owes them, negative = they owe the group.
export function computeGroupMemberBalances(
  members: { id: string; name: string }[],
  transactions: {
    amount: number
    paidBy: { id: string }
    splits: { userId: string; amount: number }[]
  }[]
) {
  const balances = new Map<string, number>()
  for (const member of members) balances.set(member.id, 0)

  for (const tx of transactions) {
    // Payer is credited the full amount they fronted
    balances.set(tx.paidBy.id, (balances.get(tx.paidBy.id) ?? 0) + Number(tx.amount))
    // Each split participant is debited their share
    for (const split of tx.splits) {
      balances.set(split.userId, (balances.get(split.userId) ?? 0) - Number(split.amount))
    }
  }

  return members.map(member => ({
    id: member.id,
    name: member.name,
    balance: Math.round((balances.get(member.id) ?? 0) * 100) / 100,
  }))
}
