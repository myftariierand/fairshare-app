import { useState } from 'react'
import { toast } from 'sonner-native'

import { useAuth } from '@/lib/auth-context'
import { useDeleteAccountMutation } from '@/services/profile'
import { getErrorMessage } from '@/lib/utils'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/spinner'

const DeleteAccount = ({ needsPassword }: { needsPassword: boolean }) => {
  const { signOut } = useAuth()
  const [password, setPassword] = useState('')
  const deleteAccount = useDeleteAccountMutation()

  const handleDelete = () => {
    deleteAccount.mutate(
      { password },
      {
        onSuccess: () => signOut(),
        onError: error => toast.error(getErrorMessage(error)),
      }
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='ghost' className='w-full'>
          <Text className='text-destructive'>Delete account</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This can't be undone. Your name, email and friends are removed, along with any groups
            only you are in. Expenses you shared stay for the others, shown as "Deleted user". You
            need to settle all balances first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {needsPassword && (
          <Input
            secureTextEntry
            placeholder='Your password'
            autoComplete='current-password'
            value={password}
            onChangeText={setPassword}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          {/* A plain button, so a wrong password doesn't close the dialog */}
          <Button
            variant='destructive'
            disabled={deleteAccount.isPending || (needsPassword && !password)}
            onPress={handleDelete}
          >
            {deleteAccount.isPending ? <Spinner /> : <Text>Delete account</Text>}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAccount
