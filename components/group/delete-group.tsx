import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'
import { View } from 'react-native'

import { useDeleteGroup, useGetGroupById } from '@/services/group'
import { useAuthUser } from '@/lib/auth-context'
import { getErrorMessage } from '@/lib/utils'
import { useGroupIdParam } from '@/hooks/use-group-id-param'

import { Trash2Icon } from 'lucide-react-native'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { SectionLabel } from '@/components/ui/section-label'
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
import { Spinner } from '@/components/spinner'

const DeleteGroup = () => {
  const { groupId } = useGroupIdParam()
  const router = useRouter()
  const deleteGroup = useDeleteGroup()
  const { data } = useGetGroupById(groupId)
  const user = useAuthUser()

  const isAdmin = user.id === data?.createdById
  const hasOpenDebts = (data?.remainingDebts ?? 0) > 0
  const reason = !isAdmin
    ? 'Only the group admin can delete it.'
    : hasOpenDebts
      ? 'Everyone needs to settle up before the group can be deleted.'
      : null

  const handleDelete = () => {
    deleteGroup.mutate(groupId, {
      onSuccess: () => router.replace('/'),
      onError: error => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <View className='gap-3'>
      <SectionLabel>Danger zone</SectionLabel>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive' disabled={!!reason || deleteGroup.isPending}>
            <Icon as={Trash2Icon} className='size-4' />
            <Text>Delete group</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {data?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the group for every member. It can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction asChild disabled={deleteGroup.isPending} onPress={handleDelete}>
              <Button variant='destructive'>
                {deleteGroup.isPending ? <Spinner /> : <Text>Delete group</Text>}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Text className='text-muted-foreground text-sm'>
        {reason ?? 'A group can be deleted once every member is settled up.'}
      </Text>
    </View>
  )
}

export default DeleteGroup
