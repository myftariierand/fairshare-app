import { View } from 'react-native';
import { Stack } from 'expo-router';

import { ExpenseForm } from '@/components/group/expense-form';

export default function AddExpense() {
  return (
    <View className="p-4">
      <Stack.Screen options={{ title: 'Add Expense' }} />
      <View>
        <ExpenseForm />
      </View>
    </View>
  );
}
