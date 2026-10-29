import { toast } from 'sonner-native'

import { useRemoveFriendMutation } from '@/services/friends'

import { getErrorMessage } from '@/lib/utils'

import type { Friend } from '@/services/friends'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/spinner'

// Controlled: opened from the friend row's menu
type Props = {
  friend: Friend
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RemoveFriendDialog = (props: Props) => {
  const removeFriend = useRemoveFriendMutation()

  const handleDelete = async () => {
    try {
      await removeFriend.mutateAsync(props.friend.requestId)
      props.onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {props.friend.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll need to send a new request to be friends again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction disabled={removeFriend.isPending} onPress={handleDelete}>
            {removeFriend.isPending ? <Spinner /> : <Text>Remove</Text>}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RemoveFriendDialog
