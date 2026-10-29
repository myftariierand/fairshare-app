import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { format } from 'date-fns'

import { useAuth } from '@/lib/auth-context'
import { useGetProfileQuery } from '@/services/profile'

import { LogOutIcon, UserIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'

import { BalanceSummary } from '@/components/balance-summary'
import ToggleTheme from '@/components/profile/toggle-theme'
import AccentPicker from '@/components/profile/accent-picker'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { signOut } = useAuth()
  const { data: user } = useGetProfileQuery()

  if (!user) {
    return null
  }

  const transactions = user.groups.flatMap(group => group.transactions)
  const involvedTransactions = transactions.filter(transaction =>
    transaction.splits.some(split => split.userId === user.id)
  ).length

  return (
    // No header on this tab, so the content starts below the status bar itself
    <ScrollView
      contentContainerClassName='gap-4 px-4 pb-10'
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
    >
      <View className='flex-row items-center gap-4'>
        <InitialsAvatar name={user.name} className='size-16' textClassName='text-xl' />
        <View className='flex-1'>
          <Text className='text-2xl font-bold tracking-tight' numberOfLines={1}>
            {user.name}
          </Text>
          <Text className='text-muted-foreground mt-0.5' numberOfLines={1}>
            {user.email}
          </Text>
          <Text className='text-muted-foreground text-sm'>
            Member since {format(user.createdAt, 'MMMM yyyy')}
          </Text>
        </View>
      </View>

      <BalanceSummary userId={user.id} transactions={transactions} />

      <View className='flex-row gap-3'>
        <Stat value={user.groups.length} label='Groups' />
        <Stat value={user.friends.length} label='Friends' />
        <Stat value={involvedTransactions} label='Transactions' />
      </View>

      <SectionLabel className='mt-2'>Settings</SectionLabel>
      <Card className='gap-0 px-4 py-0'>
        <Link asChild href={'/profile/edit'}>
          <ListRow
            title={user.provider === 'local' ? 'Account & password' : 'Account'}
            leading={<Icon as={UserIcon} className='text-muted-foreground size-5' />}
            showChevron
          />
        </Link>
        <Separator />
        <ToggleTheme />
        <Separator />
        <AccentPicker />
      </Card>

      <Button variant='destructive' className='mt-2 w-full' onPress={signOut}>
        <Icon as={LogOutIcon} className='size-4' />
        <Text>Sign out</Text>
      </Button>
    </ScrollView>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card className='flex-1 gap-0.5 p-4'>
      <Text className='font-mono text-xl font-semibold'>{value}</Text>
      <Text className='text-muted-foreground text-sm'>{label}</Text>
    </Card>
  )
}
