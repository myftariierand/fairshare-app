import { View } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({
  icon,
  value,
  label,
}: {
  icon: LucideIcon
  value: number
  label: string
}) {
  return (
    <Card className='flex-1 p-0'>
      <CardContent className='flex-row items-center gap-3 p-4'>
        <Icon as={icon} size={16} />
        <View>
          <Text className='font-mono text-lg leading-none'>{value}</Text>
          <Text className='mt-1 text-xs'>{label}</Text>
        </View>
      </CardContent>
    </Card>
  )
}
