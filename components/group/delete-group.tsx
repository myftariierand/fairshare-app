import { useState } from 'react'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import { useDeleteGroup } from '@/hooks/use-group-api'

import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { getErrorMessage } from '@/lib/utils'
import { useGroupIdParam } from '@/hooks/use-group-id-param'

const CONFIRM_WORD = 'DELETE'

const DeleteGroup = () => {
  const { groupId } = useGroupIdParam()
  const router = useRouter()
  const deleteGroup = useDeleteGroup()
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
      <Text variant={'large'}>Delete</Text>
      <Text className='mb-4' variant={'muted'} textBreakStrategy='balanced'>
        A group can be deleted only if all members have settled their debts.
      </Text>
      <Input
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        editable={!deleteGroup.isPending}
        autoCapitalize='characters'
        autoCorrect={false}
        placeholder='Type "DELETE" and press Enter to confirm'
        submitBehavior='blurAndSubmit'
      />
    </>
  )
}

export default DeleteGroup
