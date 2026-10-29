import { Image, Pressable, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { ImagePlus, Trash } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type Props = {
  value: ImagePicker.ImagePickerAsset | { uri: string } | null
  onChange: (asset: ImagePicker.ImagePickerAsset | null) => void
  /** 'banner' is a full-width strip, 'tile' a compact square next to a field */
  variant?: 'banner' | 'tile'
}

export const CoverPicker = ({ value, onChange, variant = 'banner' }: Props) => {
  const tile = variant === 'tile'

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
    })

    if (!result.canceled) onChange(result.assets[0])
  }

  return (
    <View className={cn(!tile && 'gap-4')}>
      <Pressable
        onPress={pick}
        accessibilityRole='button'
        accessibilityLabel={value ? 'Change group image' : 'Select group image'}
      >
        {value ? (
          <View>
            <Image
              source={{ uri: value.uri }}
              className={cn('rounded-2xl', tile ? 'size-22' : 'h-28')}
            />
            <Pressable
              onPress={() => onChange(null)}
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel='Remove cover image'
              className={cn(
                'border-background bg-destructive absolute size-8 items-center justify-center rounded-full border-2',
                tile ? '-top-2 -right-2' : '-bottom-4 left-1/2 -translate-x-1/2'
              )}
            >
              <Icon as={Trash} size={14} className='text-white' />
            </Pressable>
          </View>
        ) : (
          <View
            className={cn(
              'border-input bg-card items-center justify-center gap-1 rounded-2xl border border-dashed',
              tile ? 'size-22' : 'h-28'
            )}
          >
            <Icon as={ImagePlus} className={cn('text-muted-foreground', tile && 'size-6')} />
            <Text variant={'muted'} className='text-xs'>
              {tile ? 'Cover' : 'Add a cover image'}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}
