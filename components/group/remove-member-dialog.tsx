import { toast } from 'sonner-native'

import { useGroupIdParam } from '@/hooks/use-group-id-param'

import { getErrorMessage } from '@/lib/utils'

import type { Member } from '@/types/group'

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
import { useRemoveMember } from '@/services/group'

type Props = {
  member: Member
}

export function RemoveMemberDialog(props: Props) {
  const { groupId } = useGroupIdParam()
  const removeMember = useRemoveMember()

  const handleRemoveMember = async () => {
    try {
      await removeMember.mutateAsync({
        groupId,
        memberId: props.member.id,
      })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          disabled={removeMember.isPending}
          accessibilityLabel={`Remove ${props.member.name} from the group`}
        >
          <Icon as={UserMinusIcon} className='text-muted-foreground' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {props.member.name.split(' ')[0]}?</AlertDialogTitle>
          <AlertDialogDescription>
            {props.member.name} will lose access to this group. You can invite them again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction asChild disabled={removeMember.isPending} onPress={handleRemoveMember}>
            <Button variant={'destructive'}>
              {removeMember.isPending ? <Spinner /> : <Text>Remove</Text>}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
