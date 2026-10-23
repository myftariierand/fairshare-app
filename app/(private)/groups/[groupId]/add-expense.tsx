import { View } from 'react-native'
import { Stack } from 'expo-router'

import { ExpenseForm } from '@/components/group/expense-form'

export default function AddExpense() {
  return (
    <>
      <Stack.Screen options={{ title: 'Add Expense' }} />
      <ExpenseForm />
    </>
  )
}
