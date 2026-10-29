import { Stack, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { XIcon } from 'lucide-react-native'

import CreateGroupForm from '@/components/group/create-group-form'
import { HeaderButton, headerLeftOptions } from '@/components/header-button'

export default function NewGroupScreen() {
  const background = useCSSVariable('--color-background') as string

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New group',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: background },
          headerTitleStyle: { fontFamily: 'Geist', fontWeight: '600' },
          ...headerLeftOptions(
            <HeaderButton icon={XIcon} label='Close' onPress={() => router.back()} />
          ),
        }}
      />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <CreateGroupForm />
      </SafeAreaView>
    </>
  )
}
