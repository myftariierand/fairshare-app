import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { HandshakeIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { SignUpForm } from '@/components/sign-up-form';

export default function RegisterScreen() {
  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
        <View className="w-full max-w-sm">
          <View className="mb-2 items-center">
            <Icon as={HandshakeIcon} size={64} />
            <Text variant={'large'}>Register to FairShare</Text>
          </View>
          <View className="mb-4 flex-row justify-center">
            <Text variant={'muted'} className="text-xs">
              Already have an account?{' '}
            </Text>
            <Link asChild href={'/login'} className="text-xs underline underline-offset-4">
              <Text>Sign In</Text>
            </Link>
          </View>
          <SignUpForm />
        </View>
      </ScrollView>
    </>
  );
}
