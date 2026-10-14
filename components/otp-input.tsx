import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native'

export type OtpInputHandle = {
  focus: () => void
  blur: () => void
}

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  /** Called once when the last digit is entered or a full code is pasted. */
  onComplete?: (value: string) => void
  length?: number
  /** Turns the boxes red and shakes them whenever it flips to true. */
  error?: boolean
  disabled?: boolean
  autoFocus?: boolean
  accentColor?: string
  errorColor?: string
}

/**
 * One hidden TextInput sits on top of the visible boxes. That gives you
 * paste, SMS autofill, hardware keyboards and backspace for free, without
 * juggling focus between several inputs.
 */
export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  (
    {
      value,
      onChange,
      onComplete,
      length = 6,
      disabled = false,
      autoFocus = false,
      accentColor = '#0F766E',
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null)
    const [focused, setFocused] = useState(false)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }))

    const handleChange = (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length)
      onChange(digits)
      if (digits.length === length && value.length !== length) {
        onComplete?.(digits)
      }
    }

    const activeIndex = Math.min(value.length, length - 1)

    return (
      <View>
        <View className='flex-row gap-2' pointerEvents='none'>
          {Array.from({ length }).map((_, i) => {
            const char = value[i]
            const isActive = focused && !disabled && i === activeIndex
            return (
              <View
                key={i}
                className='bg-background dark:bg-input/30 text-foreground border-input size-10 items-center justify-center rounded-md border'
                style={[
                  // styles.cell,
                  isActive && { borderColor: accentColor, borderWidth: 2 },
                ]}
              >
                <Text className='text-foreground text-base'>{char ?? ''}</Text>
              </View>
            )
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          autoFocus={autoFocus}
          maxLength={length}
          keyboardType='number-pad'
          inputMode='numeric'
          autoComplete='email-otp'
          importantForAutofill='yes'
          caretHidden
          selectionColor='transparent'
          style={styles.hiddenInput}
          accessibilityLabel={`Verification code, ${length} digits`}
        />
      </View>
    )
  }
)

OtpInput.displayName = 'OtpInput'

/** Countdown for a "Resend code" button. */
export function useResendTimer(seconds = 30) {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    restart: () => setSecondsLeft(seconds),
  }
}

const styles = StyleSheet.create({
  // Covers the whole row so any tap focuses the input.
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: 'transparent',
  },
})
