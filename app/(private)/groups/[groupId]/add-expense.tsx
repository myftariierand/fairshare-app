import { Stack } from 'expo-router'

import { ExpenseForm } from '@/components/group/expense-form'
import { useCenteredHeader } from '@/components/header-button'

export default function AddExpense() {
  const headerOptions = useCenteredHeader('New expense')

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <ExpenseForm />
    </>
  )
}
