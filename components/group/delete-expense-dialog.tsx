import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner-native'

import { useDeleteExpense } from '@/services/group'

import { getErrorMessage } from '@/lib/utils'

import type { SingleTransaction } from '@/types/group'

import { TrashIcon } from 'lucide-react-native'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/spinner'

type Props = {
  expense: SingleTransaction
  groupId: string
}

export function DeleteExpenseDialog(props: Props) {
  const queryClient = useQueryClient()
  const deleteExpense = useDeleteExpense()

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense.mutateAsync(props.expense.id)
      queryClient.removeQueries({ queryKey: ['expenses', props.expense.id] })
      await queryClient.invalidateQueries({ queryKey: ['groups', props.groupId] })
      toast.success('Expense deleted')
      router.back()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant={'destructive'}>
          <Icon as={TrashIcon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {props.expense.description}?</AlertDialogTitle>
          <AlertDialogDescription textBreakStrategy='balanced'>
            Are you sure you want to delete this expense? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={'destructive'}
              disabled={deleteExpense.isPending}
              onPress={handleDeleteExpense}
            >
              {deleteExpense.isPending ? <Spinner /> : <Text>Delete</Text>}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
