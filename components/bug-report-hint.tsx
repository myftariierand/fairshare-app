import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BugIcon } from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

const storageKey = (userId: string) => `bugReportIntroSeen:${userId}`

// One-time card telling a newly signed-in user where to report bugs. Stored per
// account, so another account on the same phone sees it once too.
export function BugReportHint() {
  const user = useAuthUser()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(storageKey(user.id))
      .then(seen => setVisible(!seen))
      .catch(() => {})
  }, [user.id])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    AsyncStorage.setItem(storageKey(user.id), '1').catch(() => {})
  }

  return (
    <View className='bg-primary/10 border-primary/30 gap-4 rounded-xl border p-4'>
      <View className='flex-row gap-3'>
        <View className='bg-primary size-9 items-center justify-center rounded-[10px]'>
          <Icon as={BugIcon} className='text-primary-foreground size-5' />
        </View>
        <View className='flex-1'>
          <Text className='font-semibold'>Spotted a bug?</Text>
          <Text className='text-muted-foreground mt-0.5 text-sm'>
            FairShare is still new. You can report problems any time from Profile → Report a bug.
          </Text>
        </View>
      </View>
      <View className='flex-row justify-end gap-2'>
        <Button size='sm' variant='ghost' onPress={dismiss}>
          <Text>Got it</Text>
        </Button>
        <Button
          size='sm'
          onPress={() => {
            dismiss()
            router.push('/report-bug')
          }}
        >
          <Text>Report a bug</Text>
        </Button>
      </View>
    </View>
  )
}
