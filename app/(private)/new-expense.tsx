import { ActivityIndicator, FlatList, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

import { getGroups } from '@/services/group'

import { UserGroupIcon } from 'lucide-react-native'

import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { ListRow } from '@/components/ui/list-row'
import { Text } from '@/components/ui/text'
import { GroupAvatar } from '@/components/group/group-avatar'

// Opened from the center "+" tab: pick a group, then go to its Add expense screen
export default function NewExpenseScreen() {
  const { data, isPending } = useQuery({ queryKey: ['groups'], queryFn: getGroups })

  if (isPending) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <ActivityIndicator />
      </View>
    )
  }

  // Groups with open debts or no expenses yet first, then by newest
  const groups = [...(data ?? [])].sort((a, b) => {
    const activeA = a._count.transactions === 0 || a.remainingDebts > 0
    const activeB = b._count.transactions === 0 || b.remainingDebts > 0
    if (activeA !== activeB) return activeA ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <FlatList
      data={groups}
      keyExtractor={g => g.id}
      contentContainerClassName='px-4 pb-8 pt-2'
      ItemSeparatorComponent={() => <View className='bg-border h-px' />}
      ListEmptyComponent={
        <View className='gap-4'>
          <Empty
            title='No groups yet'
            icon={UserGroupIcon}
            description='Expenses live in a group. Create one first, then add friends to it.'
          />
          <Link asChild href='/groups/new' replace>
            <Button>
              <Text>Create a group</Text>
            </Button>
          </Link>
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.name}
          subtitle={`${item._count.members} member${item._count.members === 1 ? '' : 's'} · ${item.currency}`}
          leading={<GroupAvatar name={item.name} cover={item.cover} />}
          showChevron
          onPress={() => router.replace(`/groups/${item.id}/add-expense`)}
        />
      )}
    />
  )
}
