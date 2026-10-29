import { View, Share } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { useGetGroupById } from '@/services/group'

import { Share2Icon } from 'lucide-react-native'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

export default function ShareGroupDialog({ groupId }: { groupId: string }) {
  const { data } = useGetGroupById(groupId)
  const joinUrl = `${process.env.EXPO_PUBLIC_WEB_URL}/join-group/${groupId}`

  const groupName = data?.name

  const shareLink = () =>
    Share.share({
      message: groupName
        ? `Join "${groupName}" on FairShare: ${joinUrl}`
        : `Join my group on FairShare: ${joinUrl}`,
    })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='icon' variant='outline' accessibilityLabel='Share invite link or QR code'>
          <Icon as={Share2Icon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='max-w-xs'>
        <AlertDialogHeader className='items-center'>
          <AlertDialogTitle>Invite to {groupName}</AlertDialogTitle>
          <AlertDialogDescription className='text-center'>
            Friends scan this with their phone camera, or you send them the link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* QR codes need dark-on-light to scan, whatever the theme */}
        <View
          className='self-center rounded-2xl bg-white p-4'
          accessible
          accessibilityLabel='QR code for the group invite link'
        >
          <QRCode value={joinUrl} size={200} color='#000' backgroundColor='#fff' />
        </View>
        <AlertDialogFooter className='flex-col'>
          <AlertDialogAction asChild>
            <Button onPress={shareLink}>
              <Text>Share invite link</Text>
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel>
            <Text>Done</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
