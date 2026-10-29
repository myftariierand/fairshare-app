import { Stack } from 'expo-router'

import { ExpenseForm } from '@/components/group/expense-form'

export default function AddExpense() {
  return (
    <>
      <Stack.Screen options={{ title: 'New expense' }} />
      <ExpenseForm />
    </>
  )
}
