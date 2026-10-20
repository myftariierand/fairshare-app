import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useUniwind } from 'uniwind'
import { toast } from 'sonner-native'

import { getProfile, signInWithGoogle } from '@/lib/auth'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Image, Platform, View } from 'react-native'
import { useAuth } from '@/lib/auth-context'

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: 'oauth_google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
  // {
  //   type: 'oauth_apple',
  //   source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
  //   useTint: true,
  // },
]

export function SocialConnections() {
  const { theme } = useUniwind()
  const [loading, setLoading] = useState(false)

  const { setTokens, setUser } = useAuth()

  const handlePress = async (type: string) => {
    if (type === 'oauth_google') {
      if (loading) return
      setLoading(true)
      try {
        const data = await signInWithGoogle()
        if (!data) return
        const { accessToken, refreshToken } = data
        await setTokens({ accessToken, refreshToken })
        const user = await getProfile()
        setUser(user)
      } catch (e: any) {
        toast.error('Sign-in failed', e.message ?? 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <View className='gap-2 sm:flex-row sm:gap-3'>
      {SOCIAL_CONNECTION_STRATEGIES.map(strategy => {
        return (
          <Button
            key={strategy.type}
            variant='outline'
            size='sm'
            className='sm:flex-1'
            disabled={loading}
            onPress={() => handlePress(strategy.type)}
          >
            <Image
              className={cn('size-4', strategy.useTint && Platform.select({ web: 'dark:invert' }))}
              tintColor={Platform.select({
                native: strategy.useTint ? (theme === 'dark' ? 'white' : 'black') : undefined,
              })}
              source={strategy.source}
            />
          </Button>
        )
      })}
    </View>
  )
}
