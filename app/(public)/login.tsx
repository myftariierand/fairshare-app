import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { HandshakeIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { SignInForm } from '@/components/sign-in-form';

export default function SignInScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
        <View className="w-full max-w-sm">
          <View className="mb-4 items-center">
            <Icon as={HandshakeIcon} size={64} />
            <Text variant={'large'}>Welcome to FairShare</Text>
          </View>
          <SignInForm />
        </View>
      </ScrollView>
    </>
  );
}
