import { Stack, useLocalSearchParams } from 'expo-router'

import { useGetExpenseById } from '@/services/group'
import { ExpenseForm } from '@/components/group/expense-form'
import { useCenteredHeader } from '@/components/header-button'

export default function EditExpenseScreen() {
  const { expenseId } = useLocalSearchParams<{ groupId: string; expenseId: string }>()
  const { data: expense } = useGetExpenseById(expenseId)
  const headerOptions = useCenteredHeader('Edit expense')

  if (!expense) return null

  return (
    <>
      <Stack.Screen options={{ headerShown: true, ...headerOptions }} />
      <ExpenseForm data={expense} />
    </>
  )
}
