import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'
import { Pressable, View } from 'react-native'

import { useDeleteGroup, useGetGroupById } from '@/services/group'
import { useAuthUser } from '@/lib/auth-context'
import { cn, getErrorMessage } from '@/lib/utils'
import { useGroupIdParam } from '@/hooks/use-group-id-param'

import { Trash2Icon } from 'lucide-react-native'

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
      <View className='bg-card border-destructive/30 overflow-hidden rounded-xl border'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Pressable
              role='button'
              disabled={!!reason || deleteGroup.isPending}
              accessibilityLabel='Delete group'
              className={cn(
                'min-h-14 flex-row items-center gap-3 px-4 active:opacity-70',
                reason && 'opacity-60'
              )}
            >
              <Icon
                as={Trash2Icon}
                className={cn('size-5', reason ? 'text-muted-foreground' : 'text-destructive')}
              />
              <Text
                className={cn(
                  'flex-1 font-semibold',
                  reason ? 'text-muted-foreground' : 'text-destructive'
                )}
              >
                Delete group
              </Text>
              <View className='bg-secondary rounded-full px-2.5 py-1'>
                <Text className='text-muted-foreground text-xs font-semibold'>Admin only</Text>
              </View>
            </Pressable>
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
              <AlertDialogAction
                variant='destructive'
                disabled={deleteGroup.isPending}
                onPress={handleDelete}
              >
                {deleteGroup.isPending ? <Spinner /> : <Text>Delete group</Text>}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
      <Text className='text-muted-foreground text-sm'>
        {reason ?? 'A group can be deleted once every member is settled up.'}
      </Text>
    </View>
  )
}

export default DeleteGroup
