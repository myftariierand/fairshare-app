import { useState } from 'react'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import { useDeleteGroup, useGetGroupById } from '@/services/group'
import { useAuthUser } from '@/lib/auth-context'

import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { getErrorMessage } from '@/lib/utils'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { View } from 'react-native'
import { Badge } from '@/components/ui/badge'

const CONFIRM_WORD = 'DELETE'

const DeleteGroup = () => {
  const { groupId } = useGroupIdParam()
  const router = useRouter()
  const deleteGroup = useDeleteGroup()
  const { data } = useGetGroupById(groupId)
  const user = useAuthUser()

  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (deleteGroup.isPending) return

    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Type "${CONFIRM_WORD}" exactly to delete this group.`)
      return
    }

    deleteGroup.mutate(groupId, {
      onSuccess: () => {
        setValue('')
        router.replace('/') // adjust to your groups list route
      },
      onError: error => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  return (
    <>
      <View className='mb-1 flex-row gap-2'>
        <Text variant={'large'}>Delete</Text>
        <Badge variant={'secondary'}>
          <Text>Admin Only</Text>
        </Badge>
      </View>
      <Text className='mb-4' variant={'muted'} textBreakStrategy='balanced'>
        A group can be deleted only if all members have settled their debts.
      </Text>
      <Input
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        editable={!deleteGroup.isPending && user.id === data?.createdById}
        autoCapitalize='characters'
        autoCorrect={false}
        placeholder='Type "DELETE" and press Enter to confirm'
        submitBehavior='blurAndSubmit'
      />
    </>
  )
}

export default DeleteGroup
