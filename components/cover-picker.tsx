import { Image, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ImagePlus, Trash } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type Props = {
  value: ImagePicker.ImagePickerAsset | null;
  onChange: (asset: ImagePicker.ImagePickerAsset | null) => void;
};

export const CoverPicker = ({ value, onChange }: Props) => {
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
    });

    if (!result.canceled) onChange(result.assets[0]);
  };

  return (
    <View className="gap-4">
      <Pressable
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel={value ? 'Change group image' : 'Select group image'}>
        {value ? (
          <View>
            <Image source={{ uri: value.uri }} className="h-28 rounded-2xl" />
            <Pressable
              onPress={() => onChange(null)}
              hitSlop={8}
              className="border-background bg-destructive absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2">
              <Icon as={Trash} size={14} color={'white'} />
            </Pressable>
          </View>
        ) : (
          <View className="border-input dark:bg-input/30 bg-background h-28 items-center justify-center gap-1 rounded-2xl border border-dashed">
            <Icon as={ImagePlus} className="text-muted-foreground" />
            <Text variant={'muted'} className="text-xs">
              Add a cover image
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};
