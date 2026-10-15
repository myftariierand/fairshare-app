import { toast } from 'sonner-native'

import { useRemoveFriendMutation } from '@/services/friends'

import { getErrorMessage } from '@/lib/utils'

import type { Friend } from '@/services/friends'

import { UserMinusIcon } from 'lucide-react-native'

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
  friend: Friend
}

const RemoveFriendDialog = (props: Props) => {
  const removeFriend = useRemoveFriendMutation()

  const handleDelete = async () => {
    try {
      await removeFriend.mutateAsync(props.friend.requestId)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} variant={'outline'} className='ml-auto'>
          <Icon as={UserMinusIcon} />
          <Text>Remove</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {props.friend.name}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
