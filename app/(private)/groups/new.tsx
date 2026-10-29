import { Stack, router } from 'expo-router'
import { XIcon } from 'lucide-react-native'

import CreateGroupForm from '@/components/group/create-group-form'
import { HeaderButton, useCenteredHeader } from '@/components/header-button'

export default function NewGroupScreen() {
  const headerOptions = useCenteredHeader(
    'New group',
    <HeaderButton icon={XIcon} label='Close' onPress={() => router.back()} />
  )

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <CreateGroupForm />
    </>
  )
}
