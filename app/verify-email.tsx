import { useState } from 'react'
import { View } from 'react-native'
import { toast } from 'sonner-native'

import { useAuth } from '@/lib/auth-context'
import { useRefetchProfile } from '@/services/profile'

import { resendOtp, verifyOtp } from '@/lib/auth'
import { getErrorMessage } from '@/lib/utils'

import { MailIcon } from 'lucide-react-native'
import { OtpInput, useResendTimer } from '@/components/otp-input'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'

export default function VerifyEmailScreen() {
  const { user, setUser } = useAuth()

  const [code, setCode] = useState('')

  const refetchProfile = useRefetchProfile()

  const handleComplete = async (otp: string) => {
    try {
      if (!user) return
      await verifyOtp({ otp, email: user.email })
      const profile = await refetchProfile()

      if (!profile.emailVerified) {
        toast.error('Invalid or expired code. Please try again.')
        setCode('')
        return
      }

      toast.success('Email verified successfully!')
      setUser(profile)
    } catch (error) {
      setCode('')
      toast.error(getErrorMessage(error))
    }
  }

  const { canResend, secondsLeft, restart } = useResendTimer()

  const handleResend = async () => {
    try {
      if (!user) return
      await resendOtp({ email: user.email })
      toast.success('OTP sent successfully!')
      restart()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='mx-auto w-full max-w-sm flex-1 items-center justify-center gap-2 p-4'>
      <Icon as={MailIcon} size={32} />
      <Text variant={'h3'}>Verify your email</Text>
      <View className='mb-2'>
        <Text variant={'muted'}>Enter the 6-digit code we sent to</Text>
        <Text className='text-center'>{user?.email}</Text>
      </View>
      <OtpInput
        value={code}
        onChange={v => {
          setCode(v)
        }}
        onComplete={handleComplete}
      />
      <View className='mt-3 items-center'>
        <Text variant={'muted'}>Didn't recieve code?</Text>
        <Button variant={'ghost'} disabled={!canResend} onPress={handleResend}>
          <Text>Resend Code {secondsLeft > 0 ? `in ${secondsLeft}s` : ''}</Text>
        </Button>
      </View>
    </View>
  )
}
