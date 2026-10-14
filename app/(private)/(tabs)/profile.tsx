import { useAuth } from '@/lib/auth-context'

import { Text } from '@/components/ui/text'
import { View } from 'react-native'
import { Button } from '@/components/ui/button'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  return (
    <View>
      <Text variant={'h1'}>{user?.name}</Text>
      <Button onPress={signOut}>
        <Text>Sign Out</Text>
      </Button>
    </View>
  )
}
