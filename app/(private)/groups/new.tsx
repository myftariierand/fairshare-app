import CreateGroupForm from '@/components/group/create-group-form'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewGroupScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={{ height: '100%' }}>
      <CreateGroupForm />
    </SafeAreaView>
  )
}
