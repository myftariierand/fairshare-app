import { Stack, useLocalSearchParams } from 'expo-router'

import { useGetExpenseById } from '@/services/group'
import { ExpenseForm } from '@/components/group/expense-form'

export default function EditExpenseScreen() {
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId: string }>()
  const { data: expense } = useGetExpenseById(expenseId)

  if (!expense) return null

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit expense',
          // headerRight: () => (
          //   <>
          //     <Link asChild href={`/groups/${groupId}/expenses/${expenseId}/edit`}>
          //       <Button className="mr-2">
          //         <Icon as={PencilIcon} />
          //         <Text>Edit</Text>
          //       </Button>
          //     </Link>
          //     <DeleteExpenseDialog expense={expense} groupId={groupId} />
          //   </>
          // ),
        }}
      />
      <ExpenseForm data={expense} />
    </>
  )
}
